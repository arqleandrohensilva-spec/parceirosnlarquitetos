import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { z } from "zod";
import { ArrowDown, ArrowUpRight, Check } from "lucide-react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

const whatsappUrl = "https://wa.me/5512996235559?text=Ol%C3%A1%2C%20vim%20pela%20p%C3%A1gina%20de%20parceiros%20e%20quero%20receber%20a%20tabela%20de%20projetos%20para%20financiamento%20Caixa.";

const leadSchema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome.").max(100),
  empresa: z.string().trim().min(2, "Informe a empresa.").max(120),
  tipo: z.enum(["Construtora", "Correspondente Caixa", "Imobiliária", "Loteamento", "Outro"]),
  cidade: z.string().trim().min(2, "Informe a cidade.").max(100),
  whatsapp: z.string().regex(/^\(\d{2}\) \d{5}-\d{4}$/, "Informe um WhatsApp válido."),
  demanda_mensal: z.enum(["Menos de 1", "1 a 2", "3 a 5", "Mais de 5"]),
});

export const Route = createFileRoute("/parceiros")({
  head: () => ({
    meta: [
      { title: "Projeto para financiamento Caixa | NL Arquitetos — São José dos Campos" },
      { name: "description", content: "Projeto arquitetônico para construção financiada pela Caixa, com preço fixo por metragem e prazo por escrito. Para construtoras e correspondentes de São José dos Campos e região." },
      { property: "og:title", content: "Projeto para financiamento Caixa | NL Arquitetos — São José dos Campos" },
      { property: "og:description", content: "Projeto arquitetônico para construção financiada pela Caixa, com preço fixo por metragem e prazo por escrito. Para construtoras e correspondentes de São José dos Campos e região." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/parceiros" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/parceiros" }],
  }),
  component: ParceirosPage,
});

const problems = [
  ["Projeto que volta da prefeitura", "Cada pedido de correção empurra o alvará, e o cliente começa a perguntar o que está acontecendo."],
  ["Cliente parado esperando planta", "O crédito está encaminhado, mas sem projeto não há o que levar para a agência."],
  ["Preço do projeto que muda no caminho", "Orçamento aberto vira discussão. Com a gente, o valor é fechado antes de começar."],
];

const steps = [
  ["Você indica o cliente", "Manda o contato e os documentos do terreno. Respondemos no mesmo dia útil."],
  ["Pacote e prazo por escrito", "Definimos o pacote pela metragem e o cliente recebe preço e prazo antes de começar."],
  ["Projeto e prefeitura", "Desenvolvemos o projeto, emitimos o RRT e protocolamos, respondendo às correções."],
  ["Documentação para a agência", "Entregamos a documentação técnica do projeto para seguir com o financiamento."],
];

const packages = [
  { name: "Essencial", size: "Casas de até 80 m²", price: "R$ 3.400", items: ["Projeto arquitetônico", "Projeto legal para a prefeitura", "RRT"], time: "20 dias úteis" },
  { name: "Padrão", size: "Casas de 80 a 150 m²", price: "R$ 5.200", items: ["Tudo do Essencial", "Documentação técnica para o financiamento"], time: "25 dias úteis", featured: true },
  { name: "Completo", size: "Acima de 150 m² ou terreno com ajustes", price: "R$ 7.400", prefix: "a partir de", items: ["Tudo do Padrão", "Estudo de implantação no lote", "Acompanhamento da aprovação"], time: "30 dias úteis · R$ 42/m² acima de 175 m²" },
];

const faqs = [
  ["Quais cidades vocês atendem?", "São José dos Campos, Jacareí, Caçapava e Taubaté. Outras cidades da região, consulte."],
  ["Os projetos complementares estão incluídos?", "Não. Estrutural, elétrico e hidráulico ficam com o engenheiro da construtora ou podem ser contratados à parte."],
  ["Quem paga o projeto, a construtora ou o cliente?", "Como for melhor para a sua operação. Fazemos contrato direto com a construtora ou com o cliente final."],
  ["Como é o pagamento?", "[PREENCHER CONDIÇÕES DE PAGAMENTO]"],
  ["Vocês pagam comissão por indicação?", "Não. O Código de Ética do CAU não permite pagar por indicação de clientes. O que oferecemos é prazo e preço fechados, que ajudam você a fechar e entregar mais obras."],
];

function Eyebrow({ children, inverse = false }: { children: ReactNode; inverse?: boolean }) {
  return <p className={`font-label text-[11px] font-bold tracking-[2px] uppercase ${inverse ? "text-travertine" : "text-bronze"}`}>{children}</p>;
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="mt-4 max-w-3xl font-editorial text-3xl leading-[1.08] font-normal sm:text-4xl lg:text-5xl">{children}</h2>;
}

function WhatsappButton({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return <Button asChild className={`min-h-12 rounded-sm px-5 ${light ? "bg-background text-foreground hover:bg-secondary" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}><a href={whatsappUrl} target="_blank" rel="noreferrer">{children}<ArrowUpRight /></a></Button>;
}

function ParceirosPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background">
        <div className="mx-auto grid min-h-20 max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 sm:px-8 lg:px-12">
          <a href="/parceiros" className="flex min-w-0 items-baseline gap-2" aria-label="NL Arquitetos">
            <span className="font-display text-4xl font-semibold leading-none">NL</span>
            <span className="truncate font-label text-[10px] tracking-[2px]">ARQUITETOS</span>
          </a>
          <Button asChild variant="outline" className="min-h-12 rounded-sm border-foreground bg-transparent px-4"><a href={whatsappUrl} target="_blank" rel="noreferrer"><span className="hidden sm:inline">Falar no </span>WhatsApp</a></Button>
        </div>
      </header>

      <section className="px-5 py-16 sm:px-8 sm:py-24 lg:px-12 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,.65fr)] lg:items-end">
          <div>
            <Eyebrow>Para construtoras e correspondentes Caixa</Eyebrow>
            <h1 className="mt-5 max-w-4xl font-display text-[clamp(3rem,7vw,6.8rem)] leading-[.88] font-medium">Seu cliente já tem o crédito. A obra não pode travar no projeto.</h1>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-muted-foreground">Projeto completo para construção financiada pela Caixa, com o que a prefeitura e a agência exigem. Preço fixo por metragem, prazo por escrito e um arquiteto responsável do começo à aprovação.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <WhatsappButton>Receber a tabela no WhatsApp</WhatsappButton>
              <Button asChild variant="outline" className="min-h-12 rounded-sm border-foreground bg-transparent px-5"><a href="#pacotes">Ver pacotes e preços<ArrowDown /></a></Button>
            </div>
          </div>
          <ol className="border-t border-border">
            {["Preço fechado antes de começar", "Prazo de entrega por escrito", "RRT e arquiteto responsável", "São José dos Campos e região"].map((item, i) => <li key={item} className="grid grid-cols-[44px_minmax(0,1fr)] gap-3 border-b border-border py-4"><span className="font-label text-xs text-bronze">0{i + 1}</span><span className="font-medium">{item}</span></li>)}
          </ol>
        </div>
      </section>

      <section className="bg-secondary px-5 py-16 sm:px-8 sm:py-24 lg:px-12"><div className="mx-auto max-w-7xl"><Eyebrow>O gargalo</Eyebrow><SectionTitle>Quando o projeto atrasa, a obra inteira para.</SectionTitle><div className="mt-10 grid gap-4 md:grid-cols-3">{problems.map(([title, text], i) => <article key={title} className="border border-border bg-background p-6 sm:p-8"><span className="font-label text-xs text-bronze">0{i + 1}</span><h3 className="mt-10 font-editorial text-2xl leading-tight">{title}</h3><p className="mt-4 leading-7 text-muted-foreground">{text}</p></article>)}</div></div></section>

      <section className="px-5 py-16 sm:px-8 sm:py-24 lg:px-12"><div className="mx-auto max-w-7xl"><Eyebrow>Como funciona</Eyebrow><SectionTitle>Quatro passos, do cliente ao protocolo.</SectionTitle><div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">{steps.map(([title, text], i) => <article key={title} className="border-t-2 border-foreground pt-5"><span className="font-display text-5xl text-bronze">0{i + 1}</span><h3 className="mt-8 font-editorial text-2xl leading-tight">{title}</h3><p className="mt-3 leading-7 text-muted-foreground">{text}</p></article>)}</div></div></section>

      <section id="pacotes" className="scroll-mt-4 bg-secondary px-5 py-16 sm:px-8 sm:py-24 lg:px-12"><div className="mx-auto max-w-7xl"><Eyebrow>Pacotes</Eyebrow><SectionTitle>Preço fixo por metragem. Sem orçamento aberto.</SectionTitle><div className="mt-10 grid items-stretch gap-4 lg:grid-cols-3">{packages.map((pkg) => <article key={pkg.name} className={`flex flex-col bg-background p-6 sm:p-8 ${pkg.featured ? "border-2 border-foreground" : "border border-border"}`}>{pkg.featured && <Eyebrow>Inclui a parte do financiamento</Eyebrow>}<h3 className={`${pkg.featured ? "mt-7" : "mt-0"} font-editorial text-3xl`}>{pkg.name}</h3><p className="mt-2 text-sm text-muted-foreground">{pkg.size}</p><div className="mt-8 min-h-20">{pkg.prefix && <p className="font-label text-[10px] tracking-[2px] uppercase text-bronze">{pkg.prefix}</p>}<p className="font-display text-5xl font-semibold">{pkg.price}</p></div><div className="my-7 h-px bg-border" /><ul className="space-y-3">{pkg.items.map(item => <li key={item} className="flex gap-3"><Check className="mt-1 size-4 shrink-0 text-bronze" strokeWidth={1.5}/><span>{item}</span></li>)}</ul><p className="mt-auto pt-9 text-sm"><strong>Prazo:</strong> {pkg.time}</p></article>)}</div><p className="mt-6 max-w-5xl text-xs leading-6 text-muted-foreground">Prazos contados do recebimento dos documentos até o protocolo. O tempo de análise da prefeitura e da Caixa não depende de nós. Projetos complementares (estrutural, elétrico e hidráulico) não estão incluídos.</p></div></section>

      <section className="px-5 py-16 sm:px-8 sm:py-24 lg:px-12"><div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:gap-20"><div><Eyebrow>Quem faz</Eyebrow><SectionTitle>Arquitetos, não só desenhistas de planta.</SectionTitle><div className="mt-7 max-w-xl space-y-5 leading-7 text-muted-foreground"><p>A NL Arquitetos é um escritório de arquitetura residencial em São José dos Campos, conduzido pelos arquitetos Leandro Henrique e Neandro Jacque.</p><p>Trabalhamos com um método: cada decisão técnica e de custo é resolvida no papel, antes da obra. Para quem constrói, isso significa menos correção, menos retrabalho e um cliente mais tranquilo.</p></div></div><blockquote className="self-center border-l-[3px] border-bronze py-3 pl-7"><p className="font-editorial text-3xl italic text-bronze sm:text-4xl">“A arquitetura como decisão.”</p><footer className="mt-6 font-label text-[10px] leading-5 tracking-[2px] uppercase">Leandro Henrique e Neandro Jacque<br/>Arquitetos · Co-fundadores</footer></blockquote></div></section>

      <LeadForm />

      <section className="px-5 py-16 sm:px-8 sm:py-24 lg:px-12"><div className="mx-auto max-w-4xl"><Eyebrow>Perguntas frequentes</Eyebrow><SectionTitle>O que você precisa saber.</SectionTitle><Accordion type="single" collapsible className="mt-10 border-t border-border">{faqs.map(([q, a], i) => <AccordionItem key={q} value={`item-${i}`}><AccordionTrigger className="py-6 text-left font-editorial text-xl font-normal hover:no-underline">{q}</AccordionTrigger><AccordionContent className="max-w-3xl pb-6 text-base leading-7 text-muted-foreground">{a}</AccordionContent></AccordionItem>)}</Accordion></div></section>

      <section className="bg-primary px-5 py-16 text-primary-foreground sm:px-8 sm:py-24 lg:px-12"><div className="mx-auto max-w-7xl"><Eyebrow inverse>Próximo passo</Eyebrow><h2 className="mt-5 max-w-4xl font-display text-5xl leading-[.95] font-medium sm:text-6xl lg:text-7xl">Tem um cliente parado esperando projeto?</h2><p className="mt-7 max-w-xl text-lg leading-8 text-primary-foreground/80">Mande uma mensagem. Respondemos com a tabela e o prazo para o caso dele.</p><div className="mt-8"><WhatsappButton light>Falar com um arquiteto no WhatsApp</WhatsappButton></div><p className="mt-5 font-label text-xs tracking-[2px] text-travertine">(12) 99623-5559</p></div></section>

      <footer className="border-t border-border px-5 py-8 sm:px-8 lg:px-12"><div className="mx-auto flex max-w-7xl flex-col gap-4 font-label text-[10px] leading-5 tracking-[2px] uppercase sm:flex-row sm:justify-between"><p className="text-bronze">NL Arquitetos · A arquitetura como decisão</p><p>nlarquitetos.com.br · CAU [PREENCHER Nº]</p></div></footer>
    </main>
  );
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits ? `(${digits}` : "";
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function LeadForm() {
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const utms = useMemo(() => {
    if (typeof window === "undefined") return {};
    const params = new URLSearchParams(window.location.search);
    const clean = (key: string) => params.get(key)?.slice(0, 200) || null;
    return { utm_source: clean("utm_source"), utm_medium: clean("utm_medium"), utm_campaign: clean("utm_campaign") };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const parsed = leadSchema.safeParse({ nome: form.get("nome"), empresa: form.get("empresa"), tipo: form.get("tipo"), cidade: form.get("cidade"), whatsapp: form.get("whatsapp"), demanda_mensal: form.get("demanda_mensal") });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({}); setStatus("loading");
    const { error } = await supabase.from("parceiros_leads").insert({ ...parsed.data, ...utms });
    setStatus(error ? "error" : "success");
  }

  if (status === "success") return <section className="bg-secondary px-5 py-16 sm:px-8 sm:py-24 lg:px-12"><div className="mx-auto max-w-3xl"><Eyebrow>Contato recebido</Eyebrow><h2 className="mt-4 font-editorial text-4xl leading-tight">Recebemos. Vamos te chamar no WhatsApp ainda hoje com a tabela.</h2><div className="mt-8"><WhatsappButton>Abrir o WhatsApp</WhatsappButton></div></div></section>;

  const fieldClass = "mt-2 h-12 rounded-sm border-border bg-background px-4 shadow-none focus-visible:ring-1 focus-visible:ring-foreground";
  const selectClass = `${fieldClass} w-full border text-base outline-none focus:ring-1 focus:ring-foreground`;
  return <section className="bg-secondary px-5 py-16 sm:px-8 sm:py-24 lg:px-12"><div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.7fr_1.3fr]"><div><Eyebrow>Parcerias</Eyebrow><SectionTitle>Quer ser parceiro? Deixe seu contato.</SectionTitle><p className="mt-6 max-w-sm leading-7 text-muted-foreground">Conte um pouco sobre a sua operação. Retornamos pelo WhatsApp com a tabela de projetos.</p></div><form onSubmit={handleSubmit} noValidate className="grid gap-5 sm:grid-cols-2">
  {[["nome", "Nome", "Seu nome"], ["empresa", "Empresa", "Nome da empresa"]].map(([name, label, placeholder]) => <div key={name}><Label htmlFor={name}>{label} *</Label><Input id={name} name={name} placeholder={placeholder} maxLength={name === "empresa" ? 120 : 100} className={fieldClass} aria-invalid={Boolean(errors[name])}/>{errors[name] && <p className="mt-1 text-xs text-destructive">{errors[name]}</p>}</div>)}
  <div><Label htmlFor="tipo">Tipo *</Label><select id="tipo" name="tipo" defaultValue="" className={selectClass} aria-invalid={Boolean(errors.tipo)}><option value="" disabled>Selecione</option>{["Construtora", "Correspondente Caixa", "Imobiliária", "Loteamento", "Outro"].map(v => <option key={v}>{v}</option>)}</select>{errors.tipo && <p className="mt-1 text-xs text-destructive">{errors.tipo}</p>}</div>
  <div><Label htmlFor="cidade">Cidade *</Label><Input id="cidade" name="cidade" placeholder="Sua cidade" maxLength={100} className={fieldClass} aria-invalid={Boolean(errors.cidade)}/>{errors.cidade && <p className="mt-1 text-xs text-destructive">{errors.cidade}</p>}</div>
  <div><Label htmlFor="whatsapp">WhatsApp *</Label><Input id="whatsapp" name="whatsapp" inputMode="tel" placeholder="(12) 99999-9999" value={phone} onChange={e => setPhone(formatPhone(e.target.value))} className={fieldClass} aria-invalid={Boolean(errors.whatsapp)}/>{errors.whatsapp && <p className="mt-1 text-xs text-destructive">{errors.whatsapp}</p>}</div>
  <div><Label htmlFor="demanda_mensal">Quantos projetos por mês vocês costumam precisar? *</Label><select id="demanda_mensal" name="demanda_mensal" defaultValue="" className={selectClass} aria-invalid={Boolean(errors.demanda_mensal)}><option value="" disabled>Selecione</option>{["Menos de 1", "1 a 2", "3 a 5", "Mais de 5"].map(v => <option key={v}>{v}</option>)}</select>{errors.demanda_mensal && <p className="mt-1 text-xs text-destructive">{errors.demanda_mensal}</p>}</div>
  <div className="sm:col-span-2"><Button type="submit" disabled={status === "loading"} className="min-h-12 w-full rounded-sm bg-primary text-primary-foreground sm:w-auto">{status === "loading" ? "Enviando..." : "Quero receber a tabela"}<ArrowUpRight /></Button>{status === "error" && <p className="mt-3 text-sm text-destructive">Não foi possível enviar agora. Tente novamente ou fale conosco pelo WhatsApp.</p>}</div></form></div></section>;
}