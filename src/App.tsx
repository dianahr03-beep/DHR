import { useState } from 'react'
import {
  ArrowRight, BarChart3, Building2, Check, CheckCircle2, Clock, Database, FileSpreadsheet,
  FolderKanban, Hourglass, LayoutDashboard, Lock, Mail, Menu, MessageCircle, Palette,
  Rocket, Scale, ShieldCheck, Smartphone, Sparkles, Stethoscope, Send, Users, X, Zap, FileWarning, Repeat,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { negocio } from '@/config'
import { cn } from '@/lib/utils'


const enlaces = [
  { href: '#solucion', label: 'Solución' },
  { href: '#industrias', label: 'Industrias' },
  { href: '#demo', label: 'Demo' },
  { href: '#cotiza', label: 'Cotiza' },
  { href: '#preguntas', label: 'Preguntas' },
]

function Logo({ light = false }: { light?: boolean }) {
  const letras = light ? 'text-white' : 'text-[#0f2342]'
  return (
    <a href="#inicio" className="flex flex-col items-center leading-none" aria-label={`${negocio.marca} · ${negocio.nombreCompleto}`}>
      <span className="flex items-center gap-1.5">
        <span className="flex flex-col items-end gap-[3px]" aria-hidden>
          <i className="block h-[2.5px] w-3.5 rounded-full bg-gradient-to-r from-transparent to-orange-400" />
          <i className="block h-[2.5px] w-6 rounded-full bg-gradient-to-r from-transparent to-orange-400" />
          <i className="block h-[2.5px] w-2.5 rounded-full bg-gradient-to-r from-transparent to-orange-400" />
        </span>
        <span className={cn('pl-[4px] font-serif text-[30px] font-semibold tracking-[6px]', letras)}>{negocio.marca}</span>
        <svg className="-ml-1 mb-3 size-3 text-orange-400" viewBox="0 0 24 24" aria-hidden><path fill="currentColor" d="M12 1l2.6 8.4L23 12l-8.4 2.6L12 23l-2.6-8.4L1 12l8.4-2.6z" /></svg>
      </span>
      <span className={cn('mt-0.5 font-serif text-[9.5px] font-semibold uppercase tracking-[2px]', light ? 'text-slate-300' : 'text-[#0f2342]/80')}>
        {negocio.nombreCompleto}
      </span>
    </a>
  )
}

function Header() {
  const [abierto, setAbierto] = useState(false)
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0f2342] shadow-lg shadow-slate-900/10">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6">
        <Logo light />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Principal">
          {enlaces.map((e) => (
            <a key={e.href} href={e.href} className="rounded-full px-4 py-2 text-[15px] font-medium text-slate-200 hover:bg-white/10 hover:text-white">
              {e.label}
            </a>
          ))}
        </nav>
        <div className="hidden lg:block">
          <Button asChild size="sm" variant="accent"><a href="#contacto">Quiero mi app <ArrowRight /></a></Button>
        </div>
        <button
          className="grid size-10 place-items-center rounded-full text-white hover:bg-white/10 lg:hidden"
          onClick={() => setAbierto(!abierto)}
          aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={abierto}
        >
          {abierto ? <X /> : <Menu />}
        </button>
      </div>
      {abierto && (
        <nav className="border-t border-white/10 bg-[#0f2342] px-4 py-4 lg:hidden" aria-label="Móvil">
          {enlaces.map((e) => (
            <a key={e.href} href={e.href} onClick={() => setAbierto(false)} className="block rounded-xl px-4 py-3 font-medium text-slate-100 hover:bg-white/10">
              {e.label}
            </a>
          ))}
          <Button asChild variant="accent" className="mt-3 w-full"><a href="#contacto" onClick={() => setAbierto(false)}>Quiero mi app</a></Button>
        </nav>
      )}
    </header>
  )
}

function BrowserFrame({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <div className={cn('overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-violet-900/20', className)}>
      <div className="flex items-center gap-1.5 border-b border-slate-200 bg-slate-50 px-4 py-2.5">
        <span className="size-3 rounded-full bg-red-400" />
        <span className="size-3 rounded-full bg-amber-400" />
        <span className="size-3 rounded-full bg-green-400" />
        <span className="ml-3 h-5 flex-1 rounded-md bg-white text-[11px] leading-5 text-slate-400 px-2 truncate">tuempresa.app</span>
      </div>
      <img src={src} alt={alt} className="block w-full" loading="lazy" />
    </div>
  )
}

function PhoneFrame({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <div className={cn('rounded-[2.2rem] border-[7px] border-slate-900 bg-slate-900 shadow-2xl shadow-violet-900/30', className)}>
      <div className="overflow-hidden rounded-[1.6rem] bg-white">
        <img src={src} alt={alt} className="block w-full" loading="lazy" />
      </div>
    </div>
  )
}

function Hero() {
  return (
    <section id="inicio" className="relative overflow-hidden bg-gradient-to-b from-violet-50 via-white to-white">
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[1100px] -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-300/40 via-fuchsia-300/30 to-orange-200/40 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 pt-14 pb-20 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pt-20 lg:pb-28">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-4 py-1.5 text-sm font-semibold text-violet-700 shadow-sm">
            <Sparkles className="size-4" /> Aplicaciones para tu empresa
          </span>
          <h1 className="mt-6 text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Tu empresa{' '}
            <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-500 bg-clip-text text-transparent">bajo tu control</span>
            <span className="mt-3 block text-2xl font-bold tracking-tight text-slate-700 sm:text-3xl lg:text-[2.1rem]">con la más alta productividad</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600 sm:text-xl">
            Creamos la app de tu empresa a la medida: tu información en un solo lugar, reportes en un clic y todo desde la computadora o el celular. Lista en {negocio.tiempoEntrega}, dependiendo del volumen de tus requerimientos, y a un costo accesible.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" variant="accent"><a href="#contacto">Quiero mi app <ArrowRight /></a></Button>
            <Button asChild size="lg" variant="outline"><a href="#demo">Ver un ejemplo real</a></Button>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[15px] font-medium text-slate-600">
            {['Sin instalar nada', 'Funciona en el celular', 'Tus datos seguros'].map((t) => (
              <li key={t} className="flex items-center gap-2"><CheckCircle2 className="size-5 text-emerald-500" />{t}</li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
          <BrowserFrame src="/capturas/juicios-lista.webp" alt="Lista de juicios de una app hecha para una firma de abogados" />
          <PhoneFrame src="/capturas/celular-juicios.webp" alt="La misma lista de juicios vista en el celular" className="absolute -bottom-12 right-2 w-[26%] min-w-[110px] animate-float sm:-right-6 lg:-right-10" />
          <div className="absolute -bottom-6 -left-4 hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:block lg:-left-8">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-emerald-100 text-emerald-600"><FileSpreadsheet className="size-5" /></span>
              <div>
                <p className="text-sm font-bold text-slate-900">Reporte del día</p>
                <p className="text-xs text-slate-500">Listo en 1 clic</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Franja() {
  const datos = [
    { icon: Clock, t: negocio.tiempoEntregaCorto, d: 'dependiendo del volumen de tus requerimientos' },
    { icon: Smartphone, t: 'Computadora y celular', d: 'una sola app, en todos lados' },
    { icon: Users, t: 'Para todo tu equipo', d: 'cada quien ve lo que le toca' },
    { icon: ShieldCheck, t: 'Datos seguros', d: 'respaldados en la nube' },
  ]
  return (
    <section className="bg-slate-950">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        {datos.map(({ icon: I, t, d }) => (
          <div key={t} className="flex items-center gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/10 text-orange-300"><I className="size-6" /></span>
            <div>
              <p className="font-bold text-white">{t}</p>
              <p className="text-sm text-slate-400">{d}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function Titulo({ etiqueta, titulo, sub, light = false, ancho = false }: { etiqueta: string; titulo: React.ReactNode; sub?: string; light?: boolean; ancho?: boolean }) {
  return (
    <div className={cn('mx-auto text-center', ancho ? 'max-w-4xl' : 'max-w-3xl')}>
      <p className={cn('text-sm font-bold uppercase tracking-widest', light ? 'text-orange-300' : 'text-violet-600')}>{etiqueta}</p>
      <h2 className={cn('mt-3 text-balance text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl', light ? 'text-white' : 'text-slate-900')}>{titulo}</h2>
      {sub && <p className={cn('mt-5 text-balance text-lg leading-relaxed', light ? 'text-violet-100' : 'text-slate-600')}>{sub}</p>}
    </div>
  )
}

function ProblemaSolucion() {
  const antes = [
    { icon: FileWarning, t: 'Excel por todos lados', d: 'Cada quien tiene su versión y nadie sabe cuál es la buena.' },
    { icon: Hourglass, t: 'Horas armando reportes', d: 'Copiar, pegar y sumar a mano cada semana o cada día.' },
    { icon: MessageCircle, t: 'Todo por WhatsApp', d: '"¿Cómo va ese asunto?" Preguntar mil veces lo mismo.' },
    { icon: Repeat, t: 'Pendientes que se olvidan', d: 'Un plazo vencido o un cobro que nadie siguió.' },
  ]
  const despues = [
    { icon: Database, t: 'Una sola fuente de verdad', d: 'Toda tu información ordenada en un solo lugar.' },
    { icon: FileSpreadsheet, t: 'Reportes en un clic', d: 'El reporte del día se arma solo y se descarga en Excel.' },
    { icon: LayoutDashboard, t: 'Ves todo de un vistazo', d: 'Un tablero con lo importante, apenas abres la app.' },
    { icon: Users, t: 'Todo tu equipo en sintonía', d: 'Cada quien ve en qué va cada asunto, sin preguntar por WhatsApp.' },
  ]
  return (
    <section id="solucion" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Titulo
          etiqueta="El problema"
          titulo={<>Tu empresa crece, pero la administración <span className="text-violet-600">te come el día</span></>}
          sub="Las grandes empresas tienen sistemas hechos a su medida. Las empresas pequeñas y medianas normalmente no, porque son caros y tardados. Nosotros cambiamos eso."
        />
        <div className="mt-16 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-red-100 bg-red-50/60 p-8">
            <p className="inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-1 text-sm font-bold text-red-700"><X className="size-4" /> Hoy</p>
            <ul className="mt-6 space-y-5">
              {antes.map(({ icon: I, t, d }) => (
                <li key={t} className="flex gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-red-500 shadow-sm"><I className="size-5" /></span>
                  <div><p className="font-bold text-slate-900">{t}</p><p className="text-slate-600">{d}</p></div>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl bg-gradient-to-br from-violet-600 to-fuchsia-600 p-8 text-white shadow-xl shadow-violet-600/25">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm font-bold"><Check className="size-4" /> Con tu app</p>
            <ul className="mt-6 space-y-5">
              {despues.map(({ icon: I, t, d }) => (
                <li key={t} className="flex gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/15"><I className="size-5" /></span>
                  <div><p className="font-bold">{t}</p><p className="text-violet-100">{d}</p></div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

function QueIncluye() {
  const items = [
    { icon: Database, c: 'bg-violet-100 text-violet-600', t: 'Base de datos', d: 'Clientes, casos, pacientes, ventas, inventario… guardados de forma segura y con respaldo.' },
    { icon: Palette, c: 'bg-pink-100 text-pink-600', t: 'Pantallas amigables', d: 'Diseño moderno con tus colores. Tu equipo la aprende a usar en minutos.' },
    { icon: BarChart3, c: 'bg-orange-100 text-orange-600', t: 'Reportes automáticos', d: 'Reportes diarios, semanales o por estatus, listos para descargar en Excel.' },
    { icon: Smartphone, c: 'bg-emerald-100 text-emerald-600', t: 'Versión para celular', d: 'Funciona en cualquier teléfono, tableta o computadora. Sin instalar nada.' },
    { icon: Lock, c: 'bg-sky-100 text-sky-600', t: 'Usuarios y permisos', d: 'El dueño ve todo; cada empleado ve solo lo suyo. Con usuario y contraseña.' },
    { icon: LayoutDashboard, c: 'bg-indigo-100 text-indigo-600', t: 'Tablero de control', d: 'Los números de tu empresa en una sola pantalla: lo que va bien y lo urgente.' },
    { icon: Rocket, c: 'bg-fuchsia-100 text-fuchsia-600', t: 'Publicada y con soporte', d: 'Te la entregamos funcionando en internet, y la mantenemos al día.' },
  ]
  return (
    <section className="bg-slate-50 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Titulo etiqueta="Qué incluye" titulo="Una aplicación completa, diseñada para tu empresa" sub="Todo lo que necesitas en un sistema profesional, hecho completamente a la medida de tu empresa." ancho />
        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ icon: I, c, t, d }) => (
            <div key={t} className="group rounded-3xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-900/5">
              <span className={cn('grid size-12 place-items-center rounded-2xl', c)}><I className="size-6" /></span>
              <h3 className="mt-5 text-lg font-bold text-slate-900">{t}</h3>
              <p className="mt-2 leading-relaxed text-slate-600">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Industrias() {
  const lista = [
    {
      id: 'abogados', icon: Scale, nombre: 'Abogados', color: 'from-violet-600 to-indigo-600',
      titulo: 'Control de juicios y cobros para tu despacho',
      texto: 'Sabe en qué va cada expediente, quién lo lleva, cuál es el siguiente paso y cuánto deja cada caso.',
      puntos: ['Expedientes con su historial de movimientos', 'Siguiente paso de cada caso', 'Cobros, gastos, impuestos y comisiones', 'Reporte diario por estatus'],
    },
    {
      id: 'doctores', icon: Stethoscope, nombre: 'Doctores y clínicas', color: 'from-emerald-500 to-teal-600',
      titulo: 'Tu consultorio organizado, sin papeles',
      texto: 'Pacientes, citas y cobros en un solo lugar, para ti y para tu recepción.',
      puntos: ['Expediente de cada paciente', 'Agenda de citas y recordatorios', 'Control de pagos y pendientes', 'Reporte de ingresos del mes'],
    },
    {
      id: 'empresas', icon: Building2, nombre: 'Empresas', color: 'from-orange-500 to-pink-500',
      titulo: 'La operación de tu empresa, en tiempo real',
      texto: 'Para pequeñas, medianas y grandes empresas: ventas, inventario, proyectos o lo que tu equipo necesite controlar.',
      puntos: ['Seguimiento de clientes y ventas', 'Inventario y pedidos', 'Tareas y proyectos por área', 'Tablero para dirección'],
    },
    {
      id: 'otros', icon: FolderKanban, nombre: 'Tu giro', color: 'from-sky-500 to-violet-600',
      titulo: '¿Tu empresa es diferente? Mejor',
      texto: 'Contadores, inmobiliarias, escuelas, talleres, constructoras… Si hoy lo llevas en Excel o en libreta, lo podemos convertir en app.',
      puntos: ['Platicamos cómo trabajas hoy', 'Diseñamos las pantallas contigo', 'Tus reportes, como los necesitas', 'Crece cuando tú creces'],
    },
  ]
  return (
    <section id="industrias" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Titulo etiqueta="Para quién" titulo="Hecha para tu tipo de empresa" sub="Cada app se diseña a partir de cómo trabajas tú, no al revés." />
        <Tabs defaultValue="abogados" className="mt-12">
          <div className="flex justify-center">
            <TabsList>
              {lista.map(({ id, icon: I, nombre }) => (
                <TabsTrigger key={id} value={id}><I />{nombre}</TabsTrigger>
              ))}
            </TabsList>
          </div>
          {lista.map(({ id, icon: I, color, titulo, texto, puntos }) => (
            <TabsContent key={id} value={id} className="mt-10">
              <div className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5 lg:grid-cols-[1fr_1.1fr]">
                <div className={cn('relative flex min-h-[220px] items-center justify-center bg-gradient-to-br p-10', color)}>
                  <I className="size-28 text-white/90 sm:size-36" strokeWidth={1.3} />
                </div>
                <div className="p-8 sm:p-10">
                  <h3 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">{titulo}</h3>
                  <p className="mt-4 text-lg text-slate-600">{texto}</p>
                  <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                    {puntos.map((p) => (
                      <li key={p} className="flex items-start gap-2.5 text-slate-700"><CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-500" />{p}</li>
                    ))}
                  </ul>
                  <Button asChild className="mt-8"><a href="#contacto">Quiero una así <ArrowRight /></a></Button>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  )
}

function Demo() {
  const vistas = [
    { id: 'tablero', label: 'Tablero del dueño', img: '/capturas/1-tablero-dueno.webp', movil: '/capturas/8-celular-tablero.webp', d: 'Apenas entras ves cuántos juicios hay por estatus, la utilidad del despacho y lo que requiere atención.' },
    { id: 'juicios', label: 'Lista de juicios', img: '/capturas/juicios-lista.webp', movil: '/capturas/celular-juicios.webp', d: 'Todos los expedientes con buscador y filtros: quién lo lleva, en qué etapa va y cuál es el siguiente paso.' },
    { id: 'finanzas', label: 'Detalle y finanzas', img: '/capturas/finanzas.webp', movil: null, d: 'Registras cobros, gastos, impuestos y comisiones de cada caso, y la app calcula sola la utilidad real.' },
    { id: 'reporte', label: 'Reporte diario', img: '/capturas/4-reporte-diario.webp', movil: null, d: 'El reporte que antes tomaba horas, ahora se genera solo y se descarga en un clic.' },
    { id: 'equipo', label: 'Equipo', img: '/capturas/5-equipo.webp', movil: null, d: 'El dueño da de alta a su equipo y cada abogado entra con su propio usuario.' },
  ]
  return (
    <section id="demo" className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-violet-950 to-slate-950 py-24">
      <div aria-hidden className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-fuchsia-600/30 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute bottom-0 left-0 h-96 w-96 rounded-full bg-violet-600/30 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <Titulo light etiqueta="Ejemplo" titulo="Así se ve una app que ya hicimos" sub="Sistema de control de juicios y cobros para una firma de abogados. Los nombres y cifras que ves son de ejemplo." />
        <Tabs defaultValue="tablero" className="mt-12">
          <div className="flex justify-center">
            <TabsList className="[&>button]:border-white/15 [&>button]:bg-white/5 [&>button]:text-violet-100 [&>button:hover]:text-white [&>button[data-state=active]]:border-white [&>button[data-state=active]]:bg-white [&>button[data-state=active]]:text-violet-700">
              {vistas.map((v) => <TabsTrigger key={v.id} value={v.id}>{v.label}</TabsTrigger>)}
            </TabsList>
          </div>
          {vistas.map((v) => (
            <TabsContent key={v.id} value={v.id} className="mt-10">
              <p className="mx-auto mb-8 max-w-2xl text-center text-lg text-violet-100">{v.d}</p>
              <div className="relative mx-auto max-w-5xl">
                <BrowserFrame src={v.img} alt={`Pantalla: ${v.label}`} className="max-h-[760px] [&_img]:object-cover [&_img]:object-top" />
                {v.movil && (
                  <PhoneFrame src={v.movil} alt={`${v.label} en el celular`} className="absolute -bottom-8 -right-2 hidden w-44 sm:block lg:-right-12" />
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
        <div className="mt-16 text-center">
          <Button asChild size="lg" variant="light"><a href="#contacto">Quiero mi app <ArrowRight /></a></Button>
        </div>
      </div>
    </section>
  )
}

function ComoFunciona() {
  const pasos = [
    { n: '1', icon: MessageCircle, t: 'Platicamos', d: 'Una llamada gratis para entender cómo trabajas hoy y qué te quita más tiempo.' },
    { n: '2', icon: Palette, t: 'Diseñamos contigo', d: 'Te mostramos cómo se verán las pantallas y los reportes antes de construir.' },
    { n: '3', icon: Zap, t: 'Construimos tu app', d: `En ${negocio.tiempoEntrega} tienes tu app funcionando, con tu información.` },
    { n: '4', icon: Rocket, t: 'La usas y crece', d: 'Capacitamos a tu equipo, la publicamos y le damos mantenimiento.' },
  ]
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Titulo etiqueta="Cómo funciona" titulo="Danos tu idea para tu aplicación en 4 pasos" sub="Sin tecnicismos. Tú nos cuentas tu empresa; nosotros nos encargamos de lo demás." />
        <ol className="relative mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div aria-hidden className="absolute left-0 right-0 top-8 hidden h-0.5 bg-gradient-to-r from-violet-200 via-fuchsia-200 to-orange-200 lg:block" />
          {pasos.map(({ n, icon: I, t, d }) => (
            <li key={n} className="relative text-center">
              <span className="relative mx-auto grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-violet-600/30">
                <I className="size-7" />
                <span className="absolute -right-2 -top-2 grid size-7 place-items-center rounded-full bg-orange-500 text-sm font-extrabold ring-4 ring-white">{n}</span>
              </span>
              <h3 className="mt-6 text-xl font-bold text-slate-900">{t}</h3>
              <p className="mt-2 leading-relaxed text-slate-600">{d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function Cotiza() {
  return (
    <section id="cotiza" className="bg-slate-50 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col items-center gap-5 rounded-3xl border border-violet-200 bg-white p-8 text-center shadow-xl shadow-violet-900/5 sm:p-14">
          <p className="text-sm font-bold uppercase tracking-widest text-violet-600">Cotiza tu proyecto</p>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">Cotización sin costo y sin compromiso</h2>
          <p className="max-w-2xl text-lg text-slate-600">Platicamos de tu empresa, entendemos qué necesitas y te damos un precio claro y accesible antes de empezar. Incluye soporte después de la entrega.</p>
          <Button asChild size="lg" variant="accent"><a href="#contacto">Cotizar mi proyecto <ArrowRight /></a></Button>
        </div>
      </div>
    </section>
  )
}

function Preguntas() {
  const faq = [
    { p: '¿Necesito saber de computación o programación?', r: 'No. Tú nos explicas cómo trabajas y nosotros hacemos todo. Si sabes usar WhatsApp, sabes usar tu app.' },
    { p: '¿Cuánto tiempo tarda?', r: `Normalmente ${negocio.tiempoEntrega}, según lo que necesite tu proyecto. Te damos una fecha clara desde el inicio.` },
    { p: '¿Funciona en el celular?', r: 'Sí. Tu app se abre desde el navegador de cualquier celular, tableta o computadora, sin instalar nada.' },
    { p: '¿Mi información está segura?', r: 'Sí. Cada persona entra con su usuario y contraseña, solo ve lo que le corresponde, y la información se guarda en la nube con respaldos.' },
    { p: '¿Puedo pedir cambios después?', r: 'Claro. Tu app crece con tu empresa: puedes agregar pantallas, reportes o usuarios cuando lo necesites.' },
    { p: '¿Trabajan con empresas fuera de mi país?', r: 'Sí. Trabajamos de forma remota, por videollamada y WhatsApp, así que podemos atenderte donde estés.' },
    { p: '¿Puedo pasar mis datos de Excel?', r: 'Sí. Te ayudamos a cargar tu información actual para que empieces a usar la app desde el primer día.' },
  ]
  return (
    <section id="preguntas" className="py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Titulo etiqueta="Preguntas frecuentes" titulo="Resolvemos tus dudas" />
        <Accordion type="single" collapsible className="mt-12 space-y-3">
          {faq.map((f, i) => (
            <AccordionItem key={i} value={`p${i}`}>
              <AccordionTrigger>{f.p}</AccordionTrigger>
              <AccordionContent>{f.r}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}

type DatosContacto = { nombre: string; telefono: string; correo?: string; empresa?: string; giro?: string; pais?: string; mensaje?: string }

// Manda los datos a tu correo (Web3Forms) y a tu WhatsApp (función de Vercel). Tu número nunca está en la página.
async function enviarContacto(d: DatosContacto, origen: string) {
  if (import.meta.env.VITE_DEMO) {
    await new Promise((r) => setTimeout(r, 600))
    return true
  }
  const texto = [
    `Origen: ${origen}`,
    `Nombre: ${d.nombre}`,
    `WhatsApp: ${d.telefono}`,
    d.correo && `Correo: ${d.correo}`,
    d.empresa && `Empresa: ${d.empresa}`,
    d.giro && `Giro: ${d.giro}`,
    d.pais && `País: ${d.pais}`,
    d.mensaje && `Mensaje: ${d.mensaje}`,
    `Responder por WhatsApp: https://wa.me/${d.telefono.replace(/\D/g, '')}`,
  ].filter(Boolean).join('\n')
  const [correoOk, whatsOk] = await Promise.all([
    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: negocio.web3formsKey,
        subject: `Nuevo cliente: ${d.nombre}${d.empresa ? ` (${d.empresa})` : ''}`,
        from_name: 'Página DHR',
        replyto: d.correo || undefined,
        message: texto,
      }),
    }).then((r) => r.ok).catch(() => false),
    fetch('/api/contacto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ giro: '', ...d }),
    }).then((r) => r.ok).catch(() => false),
  ])
  return correoOk || whatsOk
}

function Contacto() {
  const vacio = { nombre: '', empresa: '', giro: 'Abogados', pais: '', telefono: '', correo: '', mensaje: '' }
  const [form, setForm] = useState(vacio)
  const [estado, setEstado] = useState<'listo' | 'enviando' | 'ok' | 'error'>('listo')
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value })


  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    setEstado('enviando')
    try {
      if (!(await enviarContacto(form, 'Formulario'))) throw new Error()
      setEstado('ok')
      setForm(vacio)
    } catch {
      setEstado('error')
    }
  }
  const input = 'mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-100'

  return (
    <section id="contacto" className="px-4 pb-24 sm:px-6">
      <div className="relative mx-auto grid max-w-7xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-violet-700 via-fuchsia-600 to-orange-500 lg:grid-cols-2">
        <div aria-hidden className="pointer-events-none absolute -left-20 -top-20 size-80 rounded-full bg-white/10 blur-2xl" />
        <div className="relative p-8 text-white sm:p-12 lg:p-16">
          <h2 className="text-balance text-3xl font-extrabold tracking-tight sm:text-5xl">¿Listo para recuperar tu tiempo y tener el control con tu nueva aplicación?</h2>
          <p className="mt-5 text-lg text-white/90">Déjanos tus datos y te escribimos por WhatsApp o por correo. La primera asesoría es gratis.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" variant="light"><a href={`mailto:${negocio.correo}`}><Mail /> Escríbenos por correo</a></Button>
          </div>
          <ul className="mt-10 space-y-3 text-white/90">
            {['Asesoría inicial sin costo', 'Te contactamos por WhatsApp', 'Soporte después de la entrega'].map((t) => (
              <li key={t} className="flex items-center gap-3"><CheckCircle2 className="size-5 text-white" />{t}</li>
            ))}
          </ul>
        </div>
        <div className="relative p-4 sm:p-8 lg:p-12">
          {estado === 'ok' ? (
            <div className="flex h-full flex-col items-center justify-center rounded-3xl bg-white p-10 text-center shadow-2xl" role="status">
              <span className="grid size-16 place-items-center rounded-full bg-emerald-100 text-emerald-600"><CheckCircle2 className="size-9" /></span>
              <h3 className="mt-6 text-2xl font-bold text-slate-900">¡Gracias! Recibimos tu mensaje</h3>
              <p className="mt-3 text-slate-600">Te escribimos muy pronto al WhatsApp o correo que nos dejaste.</p>
              <Button className="mt-6" variant="outline" onClick={() => setEstado('listo')}>Enviar otro mensaje</Button>
            </div>
          ) : (
          <form onSubmit={enviar} className="rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
            <h3 className="text-xl font-bold text-slate-900">Pide tu asesoría gratis</h3>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold text-slate-700">Nombre
                <input required value={form.nombre} onChange={set('nombre')} className={input} placeholder="Tu nombre" autoComplete="name" />
              </label>
              <label className="text-sm font-semibold text-slate-700">Tu WhatsApp
                <input required type="tel" value={form.telefono} onChange={set('telefono')} className={input} placeholder="+52 55 1234 5678" autoComplete="tel" />
              </label>
              <label className="text-sm font-semibold text-slate-700">Correo (opcional)
                <input type="email" value={form.correo} onChange={set('correo')} className={input} placeholder="tu@correo.com" autoComplete="email" />
              </label>
              <label className="text-sm font-semibold text-slate-700">Empresa
                <input value={form.empresa} onChange={set('empresa')} className={input} placeholder="Nombre de la empresa" autoComplete="organization" />
              </label>
              <label className="text-sm font-semibold text-slate-700">Giro
                <select value={form.giro} onChange={set('giro')} className={input}>
                  {['Abogados', 'Doctores / clínica', 'Empresa', 'Otro'].map((g) => <option key={g}>{g}</option>)}
                </select>
              </label>
              <label className="text-sm font-semibold text-slate-700">País
                <input value={form.pais} onChange={set('pais')} className={input} placeholder="México, Colombia, Perú…" autoComplete="country-name" />
              </label>
              <label className="text-sm font-semibold text-slate-700 sm:col-span-2">¿Qué te gustaría controlar con tu app?
                <textarea value={form.mensaje} onChange={set('mensaje')} rows={3} className={input} placeholder="Ej. llevo mis clientes y cobros en Excel y tardo mucho en hacer reportes" />
              </label>
            </div>
            <Button type="submit" size="lg" variant="whatsapp" className="mt-6 w-full" disabled={estado === 'enviando'}>
              <MessageCircle /> {estado === 'enviando' ? 'Enviando…' : 'Quiero que me contacten'}
            </Button>
            {estado === 'error' && (
              <p className="mt-3 text-center text-sm font-medium text-red-600" role="alert">
                No se pudo enviar. Intenta de nuevo o <a href={`mailto:${negocio.correo}`} className="underline">escríbenos por correo</a>.
              </p>
            )}
          </form>
          )}
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="bg-[#0f2342]">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-10 sm:px-6 md:flex-row">
        <div className="text-center md:text-left">
          <Logo light />
          <p className="mt-3 text-sm text-slate-300">{negocio.lema}</p>
        </div>
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium text-slate-200" aria-label="Pie de página">
          {enlaces.map((e) => <a key={e.href} href={e.href} className="hover:text-orange-300">{e.label}</a>)}
        </nav>
        <p className="text-sm text-slate-400">© {new Date().getFullYear()} {negocio.marca}</p>
      </div>
    </footer>
  )
}

function WhatsAppFlotante() {
  const [abierto, setAbierto] = useState(false)
  const vacio = { nombre: '', telefono: '', mensaje: '' }
  const [d, setD] = useState(vacio)
  const [estado, setEstado] = useState<'listo' | 'enviando' | 'ok' | 'error'>('listo')
  const set = (k: keyof typeof d) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setD({ ...d, [k]: e.target.value })
  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    setEstado('enviando')
    const ok = await enviarContacto(d, 'Chat de la página')
    setEstado(ok ? 'ok' : 'error')
    if (ok) setD(vacio)
  }
  const input = 'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1fa855] focus:outline-none focus:ring-4 focus:ring-green-100'

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {abierto && (
        <div className="w-[calc(100vw-2.5rem)] max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl shadow-slate-900/25 ring-1 ring-slate-200">
          <div className="flex items-center gap-3 bg-[#0f2342] px-4 py-3 text-white">
            <div className="grid size-9 place-items-center rounded-full bg-[#1fa855]"><MessageCircle className="size-5" /></div>
            <div className="flex-1">
              <p className="font-bold leading-tight">DHR Calidad</p>
              <p className="text-xs text-white/70">Te respondemos por WhatsApp</p>
            </div>
            <button onClick={() => setAbierto(false)} aria-label="Cerrar chat" className="rounded-full p-1 text-white/80 hover:bg-white/10 hover:text-white"><X className="size-5" /></button>
          </div>
          <div className="bg-[#efeae2] p-4">
            <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white px-3 py-2 text-sm text-slate-700 shadow-sm">
              ¡Hola! 👋 Cuéntanos qué necesitas y te escribimos a tu WhatsApp.
            </div>
          </div>
          {estado === 'ok' ? (
            <div className="space-y-3 p-5 text-center">
              <CheckCircle2 className="mx-auto size-10 text-[#1fa855]" />
              <p className="font-bold text-slate-900">¡Mensaje enviado!</p>
              <p className="text-sm text-slate-600">Te escribimos muy pronto a tu WhatsApp.</p>
              <button onClick={() => setEstado('listo')} className="text-sm font-semibold text-[#1fa855] hover:underline">Enviar otro mensaje</button>
            </div>
          ) : (
            <form onSubmit={enviar} className="space-y-2.5 p-4">
              <input required value={d.nombre} onChange={set('nombre')} className={input} placeholder="Tu nombre" autoComplete="name" />
              <input required value={d.telefono} onChange={set('telefono')} className={input} placeholder="Tu WhatsApp" type="tel" autoComplete="tel" />
              <textarea required value={d.mensaje} onChange={set('mensaje')} className={cn(input, 'min-h-20 resize-none')} placeholder="Escribe tu mensaje…" />
              {estado === 'error' && <p className="text-xs text-red-600">No se pudo enviar. Intenta de nuevo.</p>}
              <button disabled={estado === 'enviando'} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1fa855] py-2.5 font-semibold text-white transition hover:bg-[#178a45] disabled:opacity-60">
                <Send className="size-4" /> {estado === 'enviando' ? 'Enviando…' : 'Enviar'}
              </button>
            </form>
          )}
        </div>
      )}
      <button
        onClick={() => setAbierto(!abierto)}
        aria-label={abierto ? 'Cerrar chat' : 'Escríbenos'}
        className="grid size-14 place-items-center rounded-full bg-[#1fa855] text-white shadow-xl shadow-green-700/30 transition hover:scale-110"
      >
        {abierto ? <X className="size-7" /> : <MessageCircle className="size-7" />}
      </button>
    </div>
  )
}

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Franja />
        <ProblemaSolucion />
        <QueIncluye />
        <Industrias />
        <Demo />
        <ComoFunciona />
        <Cotiza />
        <Preguntas />
        <Contacto />
      </main>
      <Footer />
      <WhatsAppFlotante />
    </>
  )
}
