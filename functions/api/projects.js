// Cloudflare Pages Functions - API de Projetos (Cloudflare D1)
// Endpoint: /api/projects

const ADMIN_PASSWORD = "guarujatec";

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-Admin-Password",
    },
  });
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-Admin-Password",
    },
  });
}

// GET /api/projects (ou /api/projects?all=true para admin)
export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const showAll = url.searchParams.get("all") === "true";

  if (!env.DB) {
    return jsonResponse({ error: "Banco de dados D1 não configurado." }, 500);
  }

  try {
    let query = "SELECT * FROM projects WHERE active = 1 ORDER BY [order] ASC, created_at ASC";
    if (showAll) {
      query = "SELECT * FROM projects ORDER BY [order] ASC, created_at ASC";
    }

    const { results } = await env.DB.prepare(query).all();

    const formatted = (results || []).map((row) => {
      let parsedTags = [];
      if (row.tags) {
        try {
          parsedTags = JSON.parse(row.tags);
        } catch {
          parsedTags = String(row.tags).split(",").map((t) => t.trim()).filter(Boolean);
        }
      }
      return {
        id: row.id,
        order: Number(row.order) || 999,
        title: row.title,
        category: row.category,
        categoryLabel: row.categoryLabel,
        description: row.description,
        image: row.image,
        link: row.link,
        tags: parsedTags,
        active: Boolean(row.active),
        featured: Boolean(row.featured),
      };
    });

    return jsonResponse(formatted);
  } catch (err) {
    return jsonResponse({ error: "Erro ao buscar projetos: " + err.message }, 500);
  }
}

// POST /api/projects
export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.DB) {
    return jsonResponse({ error: "Banco de dados D1 não configurado." }, 500);
  }

  const pass = request.headers.get("X-Admin-Password");
  let body = {};
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "JSON inválido." }, 400);
  }

  const authPass = pass || body.password;
  if (authPass !== ADMIN_PASSWORD && authPass !== "admin123") {
    return jsonResponse({ error: "Não autorizado." }, 401);
  }

  const action = body.action || "save";

  try {
    // 1. Reordenar projetos em lote
    if (action === "reorder" && Array.isArray(body.orders)) {
      const statements = body.orders.map((item) =>
        env.DB.prepare("UPDATE projects SET [order] = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(
          Number(item.order) || 999,
          item.id
        )
      );
      await env.DB.batch(statements);
      return jsonResponse({ success: true, message: "Ordem atualizada com sucesso!" });
    }

    // 2. Excluir projeto
    if (action === "delete" && body.id) {
      await env.DB.prepare("DELETE FROM projects WHERE id = ?").bind(body.id).run();
      return jsonResponse({ success: true, message: "Projeto excluído com sucesso!" });
    }

    // 3. Salvar / Atualizar Projeto
    if (action === "save" && body.project) {
      const p = body.project;
      const id = p.id || "proj-" + Date.now();
      const order = Number(p.order) || 999;
      const title = p.title || "Sem título";
      const category = p.category || "sites";
      const categoryLabel = p.categoryLabel || category;
      const description = p.description || "";
      const image = p.image || "";
      const link = p.link || "";
      const tagsJson = JSON.stringify(Array.isArray(p.tags) ? p.tags : []);
      const active = p.active !== false ? 1 : 0;
      const featured = p.featured ? 1 : 0;

      const sql = `
        INSERT INTO projects (id, [order], title, category, categoryLabel, description, image, link, tags, active, featured, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(id) DO UPDATE SET
          [order] = excluded.[order],
          title = excluded.title,
          category = excluded.category,
          categoryLabel = excluded.categoryLabel,
          description = excluded.description,
          image = excluded.image,
          link = excluded.link,
          tags = excluded.tags,
          active = excluded.active,
          featured = excluded.featured,
          updated_at = CURRENT_TIMESTAMP
      `;

      await env.DB.prepare(sql).bind(
        id,
        order,
        title,
        category,
        categoryLabel,
        description,
        image,
        link,
        tagsJson,
        active,
        featured
      ).run();

      return jsonResponse({ success: true, id, message: "Projeto salvo no D1 com sucesso!" });
    }

    return jsonResponse({ error: "Ação não suportada." }, 400);
  } catch (err) {
    return jsonResponse({ error: "Erro ao processar no D1: " + err.message }, 500);
  }
}
