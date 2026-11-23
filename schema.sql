-- Tabela de projetos da vitrine Guarujá Tec
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  "order" INTEGER NOT NULL DEFAULT 999,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  categoryLabel TEXT,
  description TEXT,
  image TEXT,
  link TEXT,
  tags TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  featured INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Inserção dos 6 projetos atuais
INSERT OR REPLACE INTO projects (id, "order", title, category, categoryLabel, description, image, link, tags, active, featured) VALUES
(
  'proj-1',
  1,
  'Mecamatic CRM & Gestão Web',
  'sistemas',
  'Sistema Web',
  'Sistema completo para gestão de ordens de serviço, clientes, estoque e dashboards financeiros em tempo real para empresas automotivas e de serviços.',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
  'https://guarujatec.com.br',
  '["Painel Web", "Dashboard", "Gestão", "Relatórios"]',
  1,
  1
),
(
  'proj-2',
  2,
  'FitFuel E-commerce & Suplementos',
  'ecommerce',
  'Loja Virtual',
  'E-commerce moderno de alta performance com catálogo intuitivo, cálculo dinâmico de frete, múltiplos meios de pagamento e finalização de compras por WhatsApp.',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
  'https://guarujatec.com.br',
  '["E-commerce", "Carrinho", "Checkout Rápido", "SEO"]',
  1,
  1
),
(
  'proj-3',
  3,
  'Naty Gomes Personal Trainer',
  'sites',
  'Site Profissional',
  'Landing page de alta conversão para serviços de personal trainer no Guarujá, integrada ao WhatsApp e totalmente otimizada para buscas no Google Meu Negócio.',
  'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
  'https://guarujatec.com.br',
  '["Design Exclusivo", "SEO Local", "Alta Velocidade", "Mobile"]',
  1,
  1
),
(
  'proj-4',
  4,
  'Agente IA Atendimento 24h WhatsApp',
  'automacao',
  'Automação & IA',
  'Assistente inteligente com IA conectado ao WhatsApp para qualificação automática de leads, agendamento de reuniões e suporte 24 horas por dia.',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
  'https://guarujatec.com.br',
  '["Chatbot IA", "WhatsApp API", "Qualificação", "Follow-up"]',
  1,
  0
),
(
  'proj-5',
  5,
  'DJ Cell Imports & Acessórios',
  'ecommerce',
  'Loja Virtual',
  'Catálogo vitrine com exibição de modelos, cálculo de parcelas, variações de cores/capacidade e pedidos diretos encaminhados para a equipe comercial.',
  'https://images.unsplash.com/photo-1511707171634-5f897ff02560?auto=format&fit=crop&w=800&q=80',
  'https://guarujatec.com.br',
  '["Vitrine Virtual", "Smartphones", "WhatsApp Direct", "Catálogo"]',
  1,
  0
),
(
  'proj-6',
  6,
  'Clínica Odonto Santos & Guarujá',
  'sites',
  'Site Profissional',
  'Presença digital completa e otimização para SEO Local, aumentando em mais de 180% a captação de pacientes particulares via buscas locais do Google.',
  'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80',
  'https://guarujatec.com.br',
  '["Google Meu Negócio", "SEO Local", "Autoridade", "Conversão"]',
  1,
  0
);
