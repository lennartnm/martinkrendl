'use client';
// src/app/admin/cms/page.tsx — Enhanced CMS with grouped fields, bold/italic, font selector, header/footer toggle, quiz management

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Save, CheckCircle, AlertCircle, Loader2, Upload, Eye, EyeOff,
  ChevronDown, ChevronRight, Palette, Image as ImageIcon, Video,
  Link as LinkIcon, Type, GripVertical, FileText, Plus, Trash2,
  Globe, X, ArrowRight, Bold, Italic, Layout, Settings,
  AlignLeft, Hash,
} from 'lucide-react';

const brand = '#884A4A';
type CM = Record<string, string>;
type FT = 'text' | 'textarea' | 'color' | 'image' | 'video' | 'link';
type Field = { section_key: string; field_key: string; label: string; type: FT; hint?: string; group?: string };
type SectInstance = { id: string; page_id: string; section_instance: string; section_type: string; label: string; sort_order: number; hidden: boolean };
type CmsPage = { id: string; label: string; path: string; is_system: boolean };

const GOOGLE_FONTS: {name:string;url:string;preview:string}[] = [
  {name:'Open Sans',   url:'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700;800&display=swap',    preview:'Singen mit Leichtigkeit'},
  {name:'Roboto',      url:'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap',       preview:'Stimme und Technik'},
  {name:'Lato',        url:'https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&display=swap',             preview:'Freier, sicherer singen'},
  {name:'Montserrat',  url:'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&display=swap',   preview:'Gesangsunterricht Steyr'},
  {name:'Poppins',     url:'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap',      preview:'Deine Stimme entfalten'},
  {name:'Raleway',     url:'https://fonts.googleapis.com/css2?family=Raleway:wght@400;600;700;800&display=swap',      preview:'Klang und Ausdruck'},
  {name:'Nunito',      url:'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap',       preview:'Mit Freude singen lernen'},
  {name:'Playfair Display', url:'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&display=swap', preview:'Die Kunst des Singens'},
  {name:'Merriweather',url:'https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700;900&display=swap',    preview:'Voiceation Methode'},
  {name:'Source Sans 3',url:'https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;600;700;900&display=swap',preview:'Klarheit und Präzision'},
  {name:'Inter',       url:'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',   preview:'Moderner Gesangsunterricht'},
  {name:'DM Sans',     url:'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap',     preview:'Stimme neu entdecken'},
  {name:'Outfit',      url:'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap',      preview:'Singen ohne Grenzen'},
  {name:'Plus Jakarta Sans',url:'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap',preview:'Höhen leicht erreichen'},
  {name:'Figtree',     url:'https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800&display=swap', preview:'Ausdruck und Emotion'},
];

// Groups config
const GROUP_META: Record<string, { label: string; color: string }> = {
  text:      { label: 'Text & Inhalte',  color: '#3B82F6' },
  media:     { label: 'Bilder & Videos', color: '#8B5CF6' },
  links:     { label: 'Links',           color: '#06B6D4' },
  colors:    { label: 'Farben',          color: '#F59E0B' },
  questions: { label: 'Quiz-Fragen',     color: '#10B981' },
  form:      { label: 'Formular',        color: '#6366F1' },
  settings:  { label: 'Einstellungen',   color: '#78716C' },
};

function resolveKey(field: Field, instance: string): string {
  const sk = field.section_key.replace(/__INST__/g, instance);
  return `${sk}::${field.field_key}`;
}

function DirtyBadge() {
  return <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-600">geändert</span>;
}

function ColorField({ label, hint, value, isDirty, onChange }: { label: string; hint?: string; value: string; isDirty: boolean; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2"><Palette className="h-3.5 w-3.5 text-neutral-400" /><span className="text-sm font-semibold text-neutral-800">{label}</span>{isDirty && <DirtyBadge />}</div>
      {hint && <p className="pl-5 text-xs text-neutral-400">{hint}</p>}
      <div className="flex items-center gap-3 pl-5">
        <input type="color" value={value||'#884A4A'} onChange={e=>onChange(e.target.value)} className="h-10 w-14 cursor-pointer rounded-[4px] border border-neutral-200 p-0.5" />
        <input type="text" value={value} onChange={e=>onChange(e.target.value)} placeholder="#884A4A" maxLength={9} className="h-10 w-32 rounded-[4px] border px-3 font-mono text-sm outline-none focus:border-[#884A4A]" style={{borderColor:isDirty?'#F59E0B':'#E5E7EB'}} />
        <div className="h-10 w-10 shrink-0 rounded-[4px] border border-neutral-200" style={{backgroundColor:value||'#884A4A'}} />
      </div>
    </div>
  );
}

function MediaField({ label, hint, type, value, isDirty, onChange, onUpload }: { label: string; hint?: string; type: 'image'|'video'; value: string; isDirty: boolean; onChange: (v: string)=>void; onUpload: (f: File)=>Promise<string> }) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState('');
  const [drag, setDrag] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const isVid = type==='video';
  const upload = async (f: File) => { setUploading(true); setErr(''); try { onChange(await onUpload(f)); } catch(e:any){setErr(e.message);} finally{setUploading(false);} };
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">{isVid?<Video className="h-3.5 w-3.5 text-neutral-400"/>:<ImageIcon className="h-3.5 w-3.5 text-neutral-400"/>}<span className="text-sm font-semibold text-neutral-800">{label}</span>{isDirty&&<DirtyBadge/>}</div>
      {hint&&<p className="pl-5 text-xs text-neutral-400">{hint}</p>}
      <div className="flex gap-3 pl-5">
        {value&&(isVid?<div className="h-16 w-28 shrink-0 overflow-hidden rounded-[4px] border border-neutral-200 bg-black"><video src={value} className="h-full w-full object-contain" preload="metadata"/></div>:<div className="h-16 w-16 shrink-0 overflow-hidden rounded-[4px] border border-neutral-200"><img src={value} alt="" className="h-full w-full object-cover"/></div>)}
        <div className="flex flex-1 flex-col gap-1.5">
          <div onDrop={e=>{e.preventDefault();setDrag(false);const f=e.dataTransfer.files[0];if(f)upload(f);}} onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)} onClick={()=>!uploading&&ref.current?.click()}
            className={`flex cursor-pointer items-center gap-2 rounded-[4px] border-2 border-dashed px-3 py-2 text-sm transition ${drag?'border-[#884A4A] bg-[#FDF8F8]':'border-neutral-200 hover:border-[#884A4A]'} ${uploading?'pointer-events-none opacity-50':''}`}>
            {uploading?<Loader2 className="h-4 w-4 animate-spin text-[#884A4A]"/>:<Upload className="h-4 w-4 text-neutral-400"/>}
            <span className="text-neutral-600">{uploading?'Hochladen...':isVid?'Video hochladen':'Bild hochladen'}</span>
            <span className="ml-auto text-xs text-neutral-400">max 50MB</span>
          </div>
          <input ref={ref} type="file" accept={isVid?'video/mp4,video/webm':'image/jpeg,image/png,image/webp'} className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)upload(f);}} />
          <input type="text" value={value} onChange={e=>onChange(e.target.value)} placeholder={isVid?'/video.mp4 oder https://...':'/bild.jpg oder https://...'} className="h-8 w-full rounded-[4px] border px-3 text-xs outline-none focus:border-[#884A4A]" style={{borderColor:isDirty?'#F59E0B':'#E5E7EB'}} />
          {err&&<p className="text-xs text-red-600">{err}</p>}
        </div>
      </div>
    </div>
  );
}

function RichToolbar({ value, onChange, taRef }: { value: string; onChange: (v: string)=>void; taRef?: React.RefObject<HTMLTextAreaElement> }) {
  const wrap = (b: string, a: string) => {
    if (taRef?.current) {
      const el = taRef.current;
      const s = el.selectionStart, e = el.selectionEnd;
      const sel = value.substring(s, e);
      const nv = value.substring(0,s)+b+sel+a+value.substring(e);
      onChange(nv);
      setTimeout(()=>{ el.focus(); el.setSelectionRange(s+b.length, s+b.length+sel.length); },0);
    } else {
      onChange(value+b+a);
    }
  };
  return (
    <div className="flex items-center gap-1 mb-1">
      <button type="button" title="Fett" onClick={()=>wrap('**','**')} className="flex h-6 w-6 items-center justify-center rounded border border-neutral-200 bg-white text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800 transition"><Bold className="h-3 w-3"/></button>
      <button type="button" title="Kursiv" onClick={()=>wrap('*','*')} className="flex h-6 w-6 items-center justify-center rounded border border-neutral-200 bg-white text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800 transition"><Italic className="h-3 w-3"/></button>
      <span className="ml-1 text-[10px] text-neutral-400">**fett** *kursiv*</span>
    </div>
  );
}

function TextField({ label, hint, type, value, isDirty, onChange }: { label: string; hint?: string; type: 'text'|'textarea'|'link'; value: string; isDirty: boolean; onChange: (v: string)=>void }) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        {type==='link'?<LinkIcon className="h-3.5 w-3.5 text-neutral-400"/>:<Type className="h-3.5 w-3.5 text-neutral-400"/>}
        <span className="text-sm font-semibold text-neutral-800">{label}</span>
        {type==='link'&&<span className="rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">Link</span>}
        {isDirty&&<DirtyBadge/>}
      </div>
      {hint&&<p className="pl-5 text-xs text-neutral-400">{hint}</p>}
      <div className="pl-5">
        {type==='textarea'?(
          <><RichToolbar value={value} onChange={onChange} taRef={taRef}/><textarea ref={taRef} value={value} onChange={e=>onChange(e.target.value)} rows={3} className="w-full resize-y rounded-[4px] border px-3 py-2 text-sm outline-none focus:border-[#884A4A]" style={{borderColor:isDirty?'#F59E0B':'#E5E7EB'}}/></>
        ):type==='link'?(
          <div className="flex gap-2">
            <input type="text" value={value} onChange={e=>onChange(e.target.value)} placeholder="#quiz oder https://..." className="h-10 flex-1 rounded-[4px] border px-3 font-mono text-sm outline-none focus:border-[#884A4A]" style={{borderColor:isDirty?'#F59E0B':'#E5E7EB'}}/>
            {value&&<a href={value} target={value.startsWith('http')?'_blank':'_self'} rel="noopener noreferrer" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[4px] border border-neutral-200 text-neutral-400 hover:bg-neutral-50"><Eye className="h-4 w-4"/></a>}
          </div>
        ):(
          <div className="space-y-1">
            <RichToolbar value={value} onChange={onChange}/>
            <input type="text" value={value} onChange={e=>onChange(e.target.value)} className="h-10 w-full rounded-[4px] border px-3 text-sm outline-none focus:border-[#884A4A]" style={{borderColor:isDirty?'#F59E0B':'#E5E7EB'}}/>
          </div>
        )}
      </div>
    </div>
  );
}

function QuizSelectorField({ value, isDirty, onChange }: { value: string; isDirty: boolean; onChange: (v:string)=>void }) {
  const [quizzes, setQuizzes] = useState<{id:string;label:string}[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(()=>{
    fetch('/api/admin/quiz-configs').then(r=>r.json()).then(j=>{if(j.ok)setQuizzes(j.data||[]);}).catch(()=>{});
  },[]);
  useEffect(()=>{
    const h=(e:MouseEvent)=>{if(ref.current&&!ref.current.contains(e.target as Node))setOpen(false);};
    document.addEventListener('mousedown',h);return()=>document.removeEventListener('mousedown',h);
  },[]);
  const activeId = value||'component_quiz';
  const current = quizzes.find(q=>q.id===activeId);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2"><Settings className="h-3.5 w-3.5 text-neutral-400"/><span className="text-sm font-semibold text-neutral-800">Quiz auswählen</span>{isDirty&&<DirtyBadge/>}</div>
      <div className="pl-5" ref={ref}>
        <div className="relative">
          <button type="button" onClick={()=>setOpen(v=>!v)}
            className="flex h-10 w-full items-center justify-between gap-2 rounded-[4px] border bg-white px-3 text-sm text-left transition hover:border-neutral-300"
            style={{borderColor:isDirty?'#F59E0B':'#E5E7EB'}}>
            <span className={current?'text-neutral-800 font-medium':'text-neutral-400'}>{current?.label??'Kein Quiz ausgewählt'}</span>
            <ChevronDown className={`h-4 w-4 shrink-0 text-neutral-400 transition-transform duration-150 ${open?'rotate-180':''}`}/>
          </button>
          {open&&(
            <div className="absolute left-0 top-full z-50 mt-1 w-full overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-xl">
              {quizzes.map(q=>(
                <button key={q.id} type="button" onClick={()=>{onChange(q.id);setOpen(false);}}
                  className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition ${activeId===q.id?'bg-[#FDF8F8]':'hover:bg-neutral-50'}`}>
                  <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition ${activeId===q.id?'border-[#884A4A] bg-[#884A4A]':'border-neutral-300'}`}>
                    {activeId===q.id&&<div className="h-1.5 w-1.5 rounded-full bg-white"/>}
                  </div>
                  <span className={`flex-1 truncate ${activeId===q.id?'font-semibold text-[#884A4A]':'text-neutral-700'}`}>{q.label}</span>
                  {q.id==='component_quiz'&&<span className="shrink-0 rounded-full bg-neutral-100 px-1.5 py-0.5 text-[10px] text-neutral-400">Standard</span>}
                  {activeId===q.id&&<CheckCircle className="h-3.5 w-3.5 shrink-0 text-[#884A4A]"/>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// SECT_TYPES with group annotations
const SECT_TYPES: {type:string;label:string;addable:boolean;fields:Field[]}[] = [
  {type:'hero',label:'Hero',addable:true,fields:[
    {section_key:'__INST__',field_key:'title',label:'Überschrift',type:'text',group:'text'},
    {section_key:'__INST__',field_key:'subtitle',label:'Unterzeile',type:'textarea',group:'text'},
    {section_key:'__INST__',field_key:'cta_label',label:'Button Text',type:'text',group:'text'},
    {section_key:'__INST__',field_key:'social_proof',label:'Social Proof',type:'text',group:'text'},
    {section_key:'__INST__',field_key:'cta_link',label:'Button Link',type:'link',group:'links'},
    {section_key:'__INST__',field_key:'image',label:'Hintergrundbild',type:'image',group:'media',hint:'Empfohlen: 1920×800px'},
  ]},
  {type:'image_text',label:'Bild + Text',addable:true,fields:[
    {section_key:'__INST__',field_key:'title',label:'Überschrift',type:'text',group:'text'},
    {section_key:'__INST__',field_key:'text',label:'Text',type:'textarea',group:'text'},
    {section_key:'__INST__',field_key:'bullet_1',label:'Punkt 1',type:'text',group:'text'},
    {section_key:'__INST__',field_key:'bullet_2',label:'Punkt 2',type:'text',group:'text'},
    {section_key:'__INST__',field_key:'bullet_3',label:'Punkt 3',type:'text',group:'text'},
    {section_key:'__INST__',field_key:'cta_label',label:'Button Text',type:'text',group:'text'},
    {section_key:'__INST__',field_key:'cta_link',label:'Button Link',type:'link',group:'links'},
    {section_key:'__INST__',field_key:'image',label:'Bild',type:'image',group:'media',hint:'800×800px'},
  ]},
  {type:'quote',label:'Zitat',addable:true,fields:[
    {section_key:'__INST__',field_key:'label',label:'Label',type:'text',group:'text'},
    {section_key:'__INST__',field_key:'quote',label:'Zitat',type:'textarea',group:'text'},
    {section_key:'__INST__',field_key:'bg',label:'Hintergrundbild',type:'image',group:'media'},
  ]},
  {type:'flowing_text',label:'Fließtext',addable:true,fields:[
    {section_key:'__INST__',field_key:'text',label:'Text',type:'textarea',group:'text'},
  ]},
  {type:'final_cta',label:'Abschluss CTA',addable:true,fields:[
    {section_key:'__INST__',field_key:'title',label:'Überschrift',type:'text',group:'text'},
    {section_key:'__INST__',field_key:'text',label:'Text',type:'textarea',group:'text'},
    {section_key:'__INST__',field_key:'cta_label',label:'Button Text',type:'text',group:'text'},
    {section_key:'__INST__',field_key:'cta_link',label:'Button Link',type:'link',group:'links'},
    {section_key:'__INST__',field_key:'image',label:'Bild',type:'image',group:'media'},
  ]},
  {type:'logos',label:'Logo-Leiste',addable:true,fields:[
    {section_key:'__INST__',field_key:'label',label:'Label',type:'text',group:'text'},
    {section_key:'__INST__',field_key:'logo_1',label:'Logo 1',type:'image',group:'media'},
    {section_key:'__INST__',field_key:'logo_2',label:'Logo 2',type:'image',group:'media'},
    {section_key:'__INST__',field_key:'logo_3',label:'Logo 3',type:'image',group:'media'},
  ]},
  {type:'feature_cards_3',label:'Karten (3er)',addable:true,fields:[
    {section_key:'__INST__1',field_key:'title',label:'Karte 1 – Titel',type:'text',group:'text'},
    {section_key:'__INST__1',field_key:'text',label:'Karte 1 – Text',type:'textarea',group:'text'},
    {section_key:'__INST__2',field_key:'title',label:'Karte 2 – Titel',type:'text',group:'text'},
    {section_key:'__INST__2',field_key:'text',label:'Karte 2 – Text',type:'textarea',group:'text'},
    {section_key:'__INST__3',field_key:'title',label:'Karte 3 – Titel',type:'text',group:'text'},
    {section_key:'__INST__3',field_key:'text',label:'Karte 3 – Text',type:'textarea',group:'text'},
    {section_key:'colors',field_key:'brand',label:'Kartenfarbe',type:'color',group:'colors'},
  ]},
  {type:'feature_cards_4',label:'Karten (4er)',addable:true,fields:[
    {section_key:'__INST__h',field_key:'title',label:'Überschrift',type:'text',group:'text'},
    {section_key:'__INST__h',field_key:'text',label:'Unterzeile',type:'textarea',group:'text'},
    {section_key:'__INST__1',field_key:'title',label:'Karte 1 – Titel',type:'text',group:'text'},
    {section_key:'__INST__1',field_key:'text',label:'Karte 1 – Text',type:'textarea',group:'text'},
    {section_key:'__INST__2',field_key:'title',label:'Karte 2 – Titel',type:'text',group:'text'},
    {section_key:'__INST__2',field_key:'text',label:'Karte 2 – Text',type:'textarea',group:'text'},
    {section_key:'__INST__3',field_key:'title',label:'Karte 3 – Titel',type:'text',group:'text'},
    {section_key:'__INST__3',field_key:'text',label:'Karte 3 – Text',type:'textarea',group:'text'},
    {section_key:'__INST__4',field_key:'title',label:'Karte 4 – Titel',type:'text',group:'text'},
    {section_key:'__INST__4',field_key:'text',label:'Karte 4 – Text',type:'textarea',group:'text'},
    {section_key:'links',field_key:'features_cta',label:'Button Link',type:'link',group:'links'},
  ]},
  {type:'video_carousel',label:'Video-Karussell',addable:true,fields:[
    {section_key:'__INST__',field_key:'title',label:'Überschrift',type:'text',group:'text'},
    {section_key:'__INST__',field_key:'text',label:'Text',type:'textarea',group:'text'},
    {section_key:'__INST__',field_key:'vid1',label:'Video 1',type:'video',group:'media'},
    {section_key:'__INST__',field_key:'thumb1',label:'Vorschau 1',type:'image',group:'media'},
    {section_key:'__INST__',field_key:'vid2',label:'Video 2',type:'video',group:'media'},
    {section_key:'__INST__',field_key:'thumb2',label:'Vorschau 2',type:'image',group:'media'},
    {section_key:'__INST__',field_key:'vid3',label:'Video 3',type:'video',group:'media'},
    {section_key:'__INST__',field_key:'thumb3',label:'Vorschau 3',type:'image',group:'media'},
  ]},
  {type:'testimonials',label:'Video-Testimonials',addable:true,fields:[
    {section_key:'__INST__1',field_key:'label',label:'T1 – Label',type:'text',group:'text'},
    {section_key:'__INST__1',field_key:'quote',label:'T1 – Zitat',type:'textarea',group:'text'},
    {section_key:'__INST__1',field_key:'author',label:'T1 – Autor',type:'text',group:'text'},
    {section_key:'__INST__1',field_key:'vid',label:'T1 – Video',type:'video',group:'media'},
    {section_key:'__INST__1',field_key:'thumb',label:'T1 – Vorschau',type:'image',group:'media'},
    {section_key:'__INST__2',field_key:'label',label:'T2 – Label',type:'text',group:'text'},
    {section_key:'__INST__2',field_key:'quote',label:'T2 – Zitat',type:'textarea',group:'text'},
    {section_key:'__INST__2',field_key:'author',label:'T2 – Autor',type:'text',group:'text'},
    {section_key:'__INST__2',field_key:'vid',label:'T2 – Video',type:'video',group:'media'},
    {section_key:'__INST__2',field_key:'thumb',label:'T2 – Vorschau',type:'image',group:'media'},
  ]},
  {type:'about',label:'Über mich',addable:true,fields:[
    {section_key:'__INST__',field_key:'label',label:'Label',type:'text',group:'text'},
    {section_key:'__INST__',field_key:'title',label:'Überschrift',type:'text',group:'text'},
    {section_key:'__INST__',field_key:'text_1',label:'Absatz 1',type:'textarea',group:'text'},
    {section_key:'__INST__',field_key:'text_2',label:'Absatz 2',type:'textarea',group:'text'},
    {section_key:'__INST__',field_key:'text_3',label:'Absatz 3',type:'textarea',group:'text'},
    {section_key:'__INST__',field_key:'image',label:'Portrait',type:'image',group:'media'},
  ]},
  {type:'reviews',label:'Bewertungen',addable:true,fields:[
    {section_key:'__INST__',field_key:'title',label:'Überschrift',type:'text',group:'text'},
    {section_key:'__INST__1',field_key:'text',label:'Bewertung 1',type:'textarea',group:'text'},
    {section_key:'__INST__1',field_key:'author',label:'Bewertung 1 – Autor',type:'text',group:'text'},
    {section_key:'__INST__2',field_key:'text',label:'Bewertung 2',type:'textarea',group:'text'},
    {section_key:'__INST__2',field_key:'author',label:'Bewertung 2 – Autor',type:'text',group:'text'},
    {section_key:'__INST__3',field_key:'text',label:'Bewertung 3',type:'textarea',group:'text'},
    {section_key:'__INST__3',field_key:'author',label:'Bewertung 3 – Autor',type:'text',group:'text'},
  ]},
  {type:'quiz',label:'Quiz',addable:true,fields:[
    {section_key:'__INST__',field_key:'quiz_id',label:'Quiz auswählen',type:'text',group:'settings'},
    {section_key:'__INST__',field_key:'bg_color',label:'Hintergrundfarbe der Sektion',type:'color',group:'colors'},
  ]},
  {type:'global_colors',label:'Globale Farben',addable:true,fields:[
    {section_key:'colors',field_key:'brand',label:'Brand-Farbe',type:'color',group:'colors'},
    {section_key:'colors',field_key:'graphite',label:'Textfarbe dunkel',type:'color',group:'colors'},
    {section_key:'colors',field_key:'dark_gray',label:'Textfarbe mittel',type:'color',group:'colors'},
    {section_key:'colors',field_key:'light_gray',label:'Textfarbe hell',type:'color',group:'colors'},
    {section_key:'colors',field_key:'quiz_bg',label:'Quiz-Hintergrund',type:'color',group:'colors'},
  ]},
  // Legacy types
  {type:'hero_legacy',label:'Hero',addable:false,fields:[
    {section_key:'hero',field_key:'title',label:'Überschrift',type:'text',group:'text'},
    {section_key:'hero',field_key:'subtitle',label:'Unterzeile',type:'textarea',group:'text'},
    {section_key:'hero',field_key:'cta_label',label:'Button Text',type:'text',group:'text'},
    {section_key:'hero',field_key:'social_proof',label:'Social Proof',type:'text',group:'text'},
    {section_key:'links',field_key:'hero_cta',label:'Button Link',type:'link',group:'links',hint:'#quiz oder https://...'},
    {section_key:'images',field_key:'hero',label:'Hintergrundbild',type:'image',group:'media',hint:'Empfohlen: 1920×800px'},
  ]},
  {type:'component_header',label:'Header',addable:false,fields:[
    {section_key:'header',field_key:'logo_text',label:'Logo Text',type:'text',group:'text'},
    {section_key:'header',field_key:'cta_label',label:'Button Text',type:'text',group:'text'},
    {section_key:'links',field_key:'header_cta',label:'Button Link',type:'link',group:'links'},
    {section_key:'colors',field_key:'header_bg',label:'Hintergrundfarbe',type:'color',group:'colors'},
  ]},
  {type:'component_footer',label:'Footer',addable:false,fields:[
    {section_key:'footer',field_key:'logo_text',label:'Logo Text',type:'text',group:'text'},
    {section_key:'footer',field_key:'tagline',label:'Tagline',type:'text',group:'text'},
    {section_key:'footer',field_key:'copyright',label:'Copyright',type:'text',group:'text'},
    {section_key:'footer',field_key:'email',label:'E-Mail',type:'text',group:'text'},
    {section_key:'footer',field_key:'phone',label:'Telefon',type:'text',group:'text'},
    {section_key:'footer',field_key:'address',label:'Adresse',type:'text',group:'text'},
    {section_key:'footer',field_key:'impressum_link',label:'Impressum Link',type:'link',group:'links'},
    {section_key:'footer',field_key:'datenschutz_link',label:'Datenschutz Link',type:'link',group:'links'},
    {section_key:'footer',field_key:'instagram_url',label:'Instagram URL',type:'link',group:'links'},
    {section_key:'footer',field_key:'facebook_url',label:'Facebook URL',type:'link',group:'links'},
    {section_key:'footer',field_key:'youtube_url',label:'YouTube URL',type:'link',group:'links'},
    {section_key:'footer',field_key:'tiktok_url',label:'TikTok URL',type:'link',group:'links'},
    {section_key:'footer',field_key:'bg_color',label:'Hintergrundfarbe',type:'color',group:'colors'},
    {section_key:'footer',field_key:'text_color',label:'Textfarbe',type:'color',group:'colors'},
    {section_key:'footer',field_key:'link_color',label:'Linkfarbe',type:'color',group:'colors'},
  ]},
  {type:'component_cookie',label:'Cookie Banner',addable:false,fields:[
    {section_key:'cookie',field_key:'message',label:'Text',type:'textarea',group:'text'},
    {section_key:'cookie',field_key:'accept_label',label:'Akzeptieren Button',type:'text',group:'text'},
    {section_key:'cookie',field_key:'decline_label',label:'Ablehnen Button',type:'text',group:'text'},
    {section_key:'cookie',field_key:'privacy_label',label:'Datenschutz Text',type:'text',group:'text'},
    {section_key:'cookie',field_key:'privacy_link',label:'Datenschutz Link',type:'link',group:'links'},
    {section_key:'cookie',field_key:'bg_color',label:'Hintergrundfarbe',type:'color',group:'colors'},
    {section_key:'cookie',field_key:'text_color',label:'Textfarbe',type:'color',group:'colors'},
    {section_key:'cookie',field_key:'accept_bg',label:'Button Farbe',type:'color',group:'colors'},
    {section_key:'cookie',field_key:'border_color',label:'Rahmenfarbe',type:'color',group:'colors'},
  ]},
  {type:'component_quiz',label:'Quiz Einstellungen',addable:false,fields:[
    {section_key:'quiz_section',field_key:'title',label:'Überschrift',type:'text',group:'text'},
    {section_key:'quiz_section',field_key:'subtitle',label:'Unterzeile',type:'text',group:'text'},
    {section_key:'quiz_q1',field_key:'question',label:'Frage 1 – Frage',type:'text',group:'questions'},
    {section_key:'quiz_q1',field_key:'subtitle',label:'Frage 1 – Untertitel',type:'text',group:'questions'},
    {section_key:'quiz_q1',field_key:'option_1',label:'Frage 1 – Option 1',type:'text',group:'questions'},
    {section_key:'quiz_q1',field_key:'option_2',label:'Frage 1 – Option 2',type:'text',group:'questions'},
    {section_key:'quiz_q1',field_key:'img_1',label:'Frage 1 – Bild 1',type:'image',group:'media'},
    {section_key:'quiz_q1',field_key:'img_2',label:'Frage 1 – Bild 2',type:'image',group:'media'},
    {section_key:'quiz_q2',field_key:'question',label:'Frage 2 – Frage',type:'text',group:'questions'},
    {section_key:'quiz_q2',field_key:'option_1',label:'Frage 2 – Option 1',type:'text',group:'questions'},
    {section_key:'quiz_q2',field_key:'option_2',label:'Frage 2 – Option 2',type:'text',group:'questions'},
    {section_key:'quiz_q2',field_key:'option_3',label:'Frage 2 – Option 3',type:'text',group:'questions'},
    {section_key:'quiz_q2',field_key:'option_4',label:'Frage 2 – Option 4',type:'text',group:'questions'},
    {section_key:'quiz_q2',field_key:'img_1',label:'Frage 2 – Bild 1',type:'image',group:'media'},
    {section_key:'quiz_q2',field_key:'img_2',label:'Frage 2 – Bild 2',type:'image',group:'media'},
    {section_key:'quiz_q2',field_key:'img_3',label:'Frage 2 – Bild 3',type:'image',group:'media'},
    {section_key:'quiz_q2',field_key:'img_4',label:'Frage 2 – Bild 4',type:'image',group:'media'},
    {section_key:'quiz_q3',field_key:'question',label:'Frage 3 – Frage',type:'text',group:'questions'},
    {section_key:'quiz_q3',field_key:'option_1',label:'Frage 3 – Option 1',type:'text',group:'questions'},
    {section_key:'quiz_q3',field_key:'option_2',label:'Frage 3 – Option 2',type:'text',group:'questions'},
    {section_key:'quiz_form',field_key:'title',label:'Formular Titel',type:'text',group:'form'},
    {section_key:'quiz_form',field_key:'subtitle',label:'Formular Text',type:'textarea',group:'form'},
    {section_key:'quiz_form',field_key:'name_label',label:'Feld: Name',type:'text',group:'form'},
    {section_key:'quiz_form',field_key:'email_label',label:'Feld: E-Mail',type:'text',group:'form'},
    {section_key:'quiz_form',field_key:'phone_label',label:'Feld: Telefon',type:'text',group:'form'},
    {section_key:'quiz_form',field_key:'submit_label',label:'Absenden Button',type:'text',group:'form'},
    {section_key:'quiz_form',field_key:'privacy_text',label:'Datenschutz Text',type:'textarea',group:'form'},
    {section_key:'colors',field_key:'brand',label:'Akzentfarbe',type:'color',group:'colors'},
    {section_key:'colors',field_key:'quiz_bg',label:'Hintergrundfarbe',type:'color',group:'colors'},
  ]},
  {type:'header',label:'Header & Navigation',addable:false,fields:[
    {section_key:'header',field_key:'logo_text',label:'Logo Text',type:'text',group:'text'},
    {section_key:'header',field_key:'cta_label',label:'Button Text',type:'text',group:'text'},
    {section_key:'links',field_key:'header_cta',label:'Button Link',type:'link',group:'links'},
    {section_key:'colors',field_key:'header_bg',label:'Hintergrundfarbe',type:'color',group:'colors'},
  ]},
  {type:'logos_legacy',label:'Logo-Leiste',addable:false,fields:[
    {section_key:'logos_section',field_key:'label',label:'Label',type:'text',group:'text'},
    {section_key:'images',field_key:'logo1',label:'Logo 1',type:'image',group:'media'},
    {section_key:'images',field_key:'logo2',label:'Logo 2',type:'image',group:'media'},
  ]},
  {type:'image_text_1',label:'Bild + Text',addable:false,fields:[
    {section_key:'image_text_1',field_key:'title',label:'Überschrift',type:'text',group:'text'},
    {section_key:'image_text_1',field_key:'text',label:'Text',type:'textarea',group:'text'},
    {section_key:'image_text_1',field_key:'bullet_1',label:'Punkt 1',type:'text',group:'text'},
    {section_key:'image_text_1',field_key:'bullet_2',label:'Punkt 2',type:'text',group:'text'},
    {section_key:'image_text_1',field_key:'bullet_3',label:'Punkt 3',type:'text',group:'text'},
    {section_key:'image_text_1',field_key:'cta_label',label:'Button Text',type:'text',group:'text'},
    {section_key:'links',field_key:'image_text_1_cta',label:'Button Link',type:'link',group:'links'},
    {section_key:'images',field_key:'section1',label:'Bild',type:'image',group:'media'},
  ]},
  {type:'image_text_2',label:'Bild + Text',addable:false,fields:[
    {section_key:'image_text_2',field_key:'title',label:'Überschrift',type:'text',group:'text'},
    {section_key:'image_text_2',field_key:'text',label:'Text',type:'textarea',group:'text'},
    {section_key:'image_text_2',field_key:'cta_label',label:'Button Text',type:'text',group:'text'},
    {section_key:'links',field_key:'image_text_2_cta',label:'Button Link',type:'link',group:'links'},
    {section_key:'images',field_key:'section2',label:'Bild',type:'image',group:'media'},
  ]},
  {type:'quote_legacy',label:'Zitat',addable:false,fields:[
    {section_key:'quote_section',field_key:'label',label:'Label',type:'text',group:'text'},
    {section_key:'quote_section',field_key:'quote',label:'Zitat',type:'textarea',group:'text'},
    {section_key:'images',field_key:'quote_bg',label:'Hintergrundbild',type:'image',group:'media'},
  ]},
  {type:'video_carousel_legacy',label:'Video-Karussell',addable:false,fields:[
    {section_key:'video_section',field_key:'title',label:'Überschrift',type:'text',group:'text'},
    {section_key:'video_section',field_key:'text',label:'Text',type:'textarea',group:'text'},
    {section_key:'videos',field_key:'carousel_1_src',label:'Video 1',type:'video',group:'media'},
    {section_key:'videos',field_key:'carousel_1_thumb',label:'Vorschau 1',type:'image',group:'media'},
    {section_key:'videos',field_key:'carousel_2_src',label:'Video 2',type:'video',group:'media'},
    {section_key:'videos',field_key:'carousel_2_thumb',label:'Vorschau 2',type:'image',group:'media'},
    {section_key:'videos',field_key:'carousel_3_src',label:'Video 3',type:'video',group:'media'},
    {section_key:'videos',field_key:'carousel_3_thumb',label:'Vorschau 3',type:'image',group:'media'},
  ]},
  {type:'feature_cards_3_legacy',label:'Karten (3er)',addable:false,fields:[
    {section_key:'feature_card_1',field_key:'title',label:'Karte 1 – Titel',type:'text',group:'text'},
    {section_key:'feature_card_1',field_key:'text',label:'Karte 1 – Text',type:'textarea',group:'text'},
    {section_key:'feature_card_2',field_key:'title',label:'Karte 2 – Titel',type:'text',group:'text'},
    {section_key:'feature_card_2',field_key:'text',label:'Karte 2 – Text',type:'textarea',group:'text'},
    {section_key:'feature_card_3',field_key:'title',label:'Karte 3 – Titel',type:'text',group:'text'},
    {section_key:'feature_card_3',field_key:'text',label:'Karte 3 – Text',type:'textarea',group:'text'},
    {section_key:'colors',field_key:'brand',label:'Kartenfarbe',type:'color',group:'colors'},
  ]},
  {type:'feature_cards_4_legacy',label:'Karten (4er)',addable:false,fields:[
    {section_key:'features_2_heading',field_key:'title',label:'Überschrift',type:'text',group:'text'},
    {section_key:'features_2_heading',field_key:'text',label:'Unterzeile',type:'textarea',group:'text'},
    {section_key:'feature2_card_1',field_key:'title',label:'Karte 1 – Titel',type:'text',group:'text'},
    {section_key:'feature2_card_1',field_key:'text',label:'Karte 1 – Text',type:'textarea',group:'text'},
    {section_key:'feature2_card_2',field_key:'title',label:'Karte 2 – Titel',type:'text',group:'text'},
    {section_key:'feature2_card_2',field_key:'text',label:'Karte 2 – Text',type:'textarea',group:'text'},
    {section_key:'feature2_card_3',field_key:'title',label:'Karte 3 – Titel',type:'text',group:'text'},
    {section_key:'feature2_card_3',field_key:'text',label:'Karte 3 – Text',type:'textarea',group:'text'},
    {section_key:'feature2_card_4',field_key:'title',label:'Karte 4 – Titel',type:'text',group:'text'},
    {section_key:'feature2_card_4',field_key:'text',label:'Karte 4 – Text',type:'textarea',group:'text'},
    {section_key:'links',field_key:'features_2_cta',label:'Button Link',type:'link',group:'links'},
  ]},
  {type:'flowing_text_legacy',label:'Fließtext',addable:false,fields:[
    {section_key:'flowing_text',field_key:'text',label:'Text',type:'textarea',group:'text'},
  ]},
  {type:'testimonials_legacy',label:'Video-Testimonials',addable:false,fields:[
    {section_key:'testimonial_1',field_key:'label',label:'T1 – Label',type:'text',group:'text'},
    {section_key:'testimonial_1',field_key:'quote',label:'T1 – Zitat',type:'textarea',group:'text'},
    {section_key:'testimonial_1',field_key:'author',label:'T1 – Autor',type:'text',group:'text'},
    {section_key:'videos',field_key:'testimonial_1_src',label:'T1 – Video',type:'video',group:'media'},
    {section_key:'videos',field_key:'testimonial_1_thumb',label:'T1 – Vorschau',type:'image',group:'media'},
    {section_key:'testimonial_2',field_key:'label',label:'T2 – Label',type:'text',group:'text'},
    {section_key:'testimonial_2',field_key:'quote',label:'T2 – Zitat',type:'textarea',group:'text'},
    {section_key:'testimonial_2',field_key:'author',label:'T2 – Autor',type:'text',group:'text'},
    {section_key:'videos',field_key:'testimonial_2_src',label:'T2 – Video',type:'video',group:'media'},
    {section_key:'videos',field_key:'testimonial_2_thumb',label:'T2 – Vorschau',type:'image',group:'media'},
  ]},
  {type:'about_legacy',label:'Über mich',addable:false,fields:[
    {section_key:'about',field_key:'label',label:'Label',type:'text',group:'text'},
    {section_key:'about',field_key:'title',label:'Überschrift',type:'text',group:'text'},
    {section_key:'about',field_key:'text_1',label:'Absatz 1',type:'textarea',group:'text'},
    {section_key:'about',field_key:'text_2',label:'Absatz 2',type:'textarea',group:'text'},
    {section_key:'about',field_key:'text_3',label:'Absatz 3',type:'textarea',group:'text'},
    {section_key:'images',field_key:'about',label:'Portrait',type:'image',group:'media'},
  ]},
  {type:'reviews_legacy',label:'Bewertungen',addable:false,fields:[
    {section_key:'reviews',field_key:'title',label:'Überschrift',type:'text',group:'text'},
    {section_key:'review_1',field_key:'text',label:'Bewertung 1',type:'textarea',group:'text'},
    {section_key:'review_1',field_key:'author',label:'Bewertung 1 – Autor',type:'text',group:'text'},
    {section_key:'review_2',field_key:'text',label:'Bewertung 2',type:'textarea',group:'text'},
    {section_key:'review_2',field_key:'author',label:'Bewertung 2 – Autor',type:'text',group:'text'},
    {section_key:'review_3',field_key:'text',label:'Bewertung 3',type:'textarea',group:'text'},
    {section_key:'review_3',field_key:'author',label:'Bewertung 3 – Autor',type:'text',group:'text'},
  ]},
  {type:'final_cta_legacy',label:'Abschluss CTA',addable:false,fields:[
    {section_key:'final_cta',field_key:'title',label:'Überschrift',type:'text',group:'text'},
    {section_key:'final_cta',field_key:'text',label:'Text',type:'textarea',group:'text'},
    {section_key:'final_cta',field_key:'cta_label',label:'Button Text',type:'text',group:'text'},
    {section_key:'links',field_key:'final_cta',label:'Button Link',type:'link',group:'links'},
    {section_key:'images',field_key:'final_cta',label:'Bild',type:'image',group:'media'},
  ]},
  {type:'danke_header',label:'Header',addable:false,fields:[
    {section_key:'danke_header',field_key:'logo_text',label:'Logo Text',type:'text',group:'text'},
  ]},
  {type:'danke_hero',label:'Inhalt',addable:false,fields:[
    {section_key:'danke_hero',field_key:'title',label:'Überschrift',type:'text',group:'text'},
    {section_key:'danke_hero',field_key:'subtitle',label:'Text',type:'textarea',group:'text'},
    {section_key:'danke_hero',field_key:'cta_label',label:'Button Text',type:'text',group:'text'},
    {section_key:'danke_hero',field_key:'cta_link',label:'Button Link',type:'link',group:'links'},
  ]},
  // ── 10 neue generische Sektionen ────────────────────────────────────────────
  {type:'cta_banner',label:'CTA Banner (zentriert)',addable:true,fields:[
    {section_key:'__INST__',field_key:'title',label:'Überschrift',type:'text',group:'text'},
    {section_key:'__INST__',field_key:'text',label:'Text',type:'textarea',group:'text'},
    {section_key:'__INST__',field_key:'cta_label',label:'Button Text',type:'text',group:'text'},
    {section_key:'__INST__',field_key:'cta_link',label:'Button Link',type:'link',group:'links'},
    {section_key:'__INST__',field_key:'bg_color',label:'Hintergrundfarbe',type:'color',group:'colors'},
  ]},
  {type:'stats_row',label:'Statistik-Zeile',addable:true,fields:[
    {section_key:'__INST__',field_key:'stat_1_number',label:'Zahl 1',type:'text',group:'text'},
    {section_key:'__INST__',field_key:'stat_1_label',label:'Label 1',type:'text',group:'text'},
    {section_key:'__INST__',field_key:'stat_2_number',label:'Zahl 2',type:'text',group:'text'},
    {section_key:'__INST__',field_key:'stat_2_label',label:'Label 2',type:'text',group:'text'},
    {section_key:'__INST__',field_key:'stat_3_number',label:'Zahl 3',type:'text',group:'text'},
    {section_key:'__INST__',field_key:'stat_3_label',label:'Label 3',type:'text',group:'text'},
    {section_key:'__INST__',field_key:'stat_4_number',label:'Zahl 4',type:'text',group:'text'},
    {section_key:'__INST__',field_key:'stat_4_label',label:'Label 4',type:'text',group:'text'},
  ]},
  {type:'faq',label:'FAQ',addable:true,fields:[
    {section_key:'__INST__',field_key:'title',label:'Überschrift',type:'text',group:'text'},
    {section_key:'__INST__1',field_key:'question',label:'Frage 1',type:'text',group:'text'},
    {section_key:'__INST__1',field_key:'answer',label:'Antwort 1',type:'textarea',group:'text'},
    {section_key:'__INST__2',field_key:'question',label:'Frage 2',type:'text',group:'text'},
    {section_key:'__INST__2',field_key:'answer',label:'Antwort 2',type:'textarea',group:'text'},
    {section_key:'__INST__3',field_key:'question',label:'Frage 3',type:'text',group:'text'},
    {section_key:'__INST__3',field_key:'answer',label:'Antwort 3',type:'textarea',group:'text'},
    {section_key:'__INST__4',field_key:'question',label:'Frage 4',type:'text',group:'text'},
    {section_key:'__INST__4',field_key:'answer',label:'Antwort 4',type:'textarea',group:'text'},
    {section_key:'__INST__5',field_key:'question',label:'Frage 5',type:'text',group:'text'},
    {section_key:'__INST__5',field_key:'answer',label:'Antwort 5',type:'textarea',group:'text'},
  ]},
  {type:'steps',label:'Schritt-für-Schritt',addable:true,fields:[
    {section_key:'__INST__',field_key:'title',label:'Überschrift',type:'text',group:'text'},
    {section_key:'__INST__',field_key:'text',label:'Unterzeile',type:'textarea',group:'text'},
    {section_key:'__INST__1',field_key:'title',label:'Schritt 1 – Titel',type:'text',group:'text'},
    {section_key:'__INST__1',field_key:'text',label:'Schritt 1 – Text',type:'textarea',group:'text'},
    {section_key:'__INST__2',field_key:'title',label:'Schritt 2 – Titel',type:'text',group:'text'},
    {section_key:'__INST__2',field_key:'text',label:'Schritt 2 – Text',type:'textarea',group:'text'},
    {section_key:'__INST__3',field_key:'title',label:'Schritt 3 – Titel',type:'text',group:'text'},
    {section_key:'__INST__3',field_key:'text',label:'Schritt 3 – Text',type:'textarea',group:'text'},
    {section_key:'__INST__4',field_key:'title',label:'Schritt 4 – Titel',type:'text',group:'text'},
    {section_key:'__INST__4',field_key:'text',label:'Schritt 4 – Text',type:'textarea',group:'text'},
  ]},
  {type:'text_columns',label:'Text (2 Spalten)',addable:true,fields:[
    {section_key:'__INST__',field_key:'title',label:'Überschrift',type:'text',group:'text'},
    {section_key:'__INST__',field_key:'col_1_title',label:'Spalte 1 – Titel',type:'text',group:'text'},
    {section_key:'__INST__',field_key:'col_1_text',label:'Spalte 1 – Text',type:'textarea',group:'text'},
    {section_key:'__INST__',field_key:'col_2_title',label:'Spalte 2 – Titel',type:'text',group:'text'},
    {section_key:'__INST__',field_key:'col_2_text',label:'Spalte 2 – Text',type:'textarea',group:'text'},
  ]},
  {type:'image_fullwidth',label:'Vollbreites Bild',addable:true,fields:[
    {section_key:'__INST__',field_key:'image',label:'Bild',type:'image',group:'media',hint:'Empfohlen: 1920×600px'},
    {section_key:'__INST__',field_key:'title',label:'Overlay Text',type:'text',group:'text'},
    {section_key:'__INST__',field_key:'overlay_opacity',label:'Overlay Stärke (0–1)',type:'text',group:'settings',hint:'z.B. 0.4'},
  ]},
  {type:'checklist',label:'Checkliste',addable:true,fields:[
    {section_key:'__INST__',field_key:'title',label:'Überschrift',type:'text',group:'text'},
    {section_key:'__INST__',field_key:'text',label:'Einleitungstext',type:'textarea',group:'text'},
    {section_key:'__INST__1',field_key:'item',label:'Punkt 1',type:'text',group:'text'},
    {section_key:'__INST__2',field_key:'item',label:'Punkt 2',type:'text',group:'text'},
    {section_key:'__INST__3',field_key:'item',label:'Punkt 3',type:'text',group:'text'},
    {section_key:'__INST__4',field_key:'item',label:'Punkt 4',type:'text',group:'text'},
    {section_key:'__INST__5',field_key:'item',label:'Punkt 5',type:'text',group:'text'},
    {section_key:'__INST__6',field_key:'item',label:'Punkt 6',type:'text',group:'text'},
    {section_key:'__INST__',field_key:'cta_label',label:'Button Text',type:'text',group:'text'},
    {section_key:'__INST__',field_key:'cta_link',label:'Button Link',type:'link',group:'links'},
  ]},
  {type:'image_gallery',label:'Bildgalerie (3er)',addable:true,fields:[
    {section_key:'__INST__',field_key:'title',label:'Überschrift',type:'text',group:'text'},
    {section_key:'__INST__1',field_key:'image',label:'Bild 1',type:'image',group:'media'},
    {section_key:'__INST__1',field_key:'caption',label:'Bildunterschrift 1',type:'text',group:'text'},
    {section_key:'__INST__2',field_key:'image',label:'Bild 2',type:'image',group:'media'},
    {section_key:'__INST__2',field_key:'caption',label:'Bildunterschrift 2',type:'text',group:'text'},
    {section_key:'__INST__3',field_key:'image',label:'Bild 3',type:'image',group:'media'},
    {section_key:'__INST__3',field_key:'caption',label:'Bildunterschrift 3',type:'text',group:'text'},
  ]},
  {type:'text_centered',label:'Text zentriert',addable:true,fields:[
    {section_key:'__INST__',field_key:'label',label:'Kleines Label',type:'text',group:'text'},
    {section_key:'__INST__',field_key:'title',label:'Überschrift',type:'text',group:'text'},
    {section_key:'__INST__',field_key:'text',label:'Text',type:'textarea',group:'text'},
    {section_key:'__INST__',field_key:'cta_label',label:'Button Text',type:'text',group:'text'},
    {section_key:'__INST__',field_key:'cta_link',label:'Button Link',type:'link',group:'links'},
  ]},
  {type:'pricing',label:'Preisübersicht',addable:true,fields:[
    {section_key:'__INST__',field_key:'title',label:'Überschrift',type:'text',group:'text'},
    {section_key:'__INST__',field_key:'text',label:'Unterzeile',type:'textarea',group:'text'},
    {section_key:'__INST__1',field_key:'name',label:'Paket 1 – Name',type:'text',group:'text'},
    {section_key:'__INST__1',field_key:'price',label:'Paket 1 – Preis',type:'text',group:'text'},
    {section_key:'__INST__1',field_key:'desc',label:'Paket 1 – Beschreibung',type:'textarea',group:'text'},
    {section_key:'__INST__1',field_key:'cta_label',label:'Paket 1 – Button',type:'text',group:'text'},
    {section_key:'__INST__1',field_key:'cta_link',label:'Paket 1 – Link',type:'link',group:'links'},
    {section_key:'__INST__2',field_key:'name',label:'Paket 2 – Name',type:'text',group:'text'},
    {section_key:'__INST__2',field_key:'price',label:'Paket 2 – Preis',type:'text',group:'text'},
    {section_key:'__INST__2',field_key:'desc',label:'Paket 2 – Beschreibung',type:'textarea',group:'text'},
    {section_key:'__INST__2',field_key:'cta_label',label:'Paket 2 – Button',type:'text',group:'text'},
    {section_key:'__INST__2',field_key:'cta_link',label:'Paket 2 – Link',type:'link',group:'links'},
    {section_key:'__INST__3',field_key:'name',label:'Paket 3 – Name',type:'text',group:'text'},
    {section_key:'__INST__3',field_key:'price',label:'Paket 3 – Preis',type:'text',group:'text'},
    {section_key:'__INST__3',field_key:'desc',label:'Paket 3 – Beschreibung',type:'textarea',group:'text'},
    {section_key:'__INST__3',field_key:'cta_label',label:'Paket 3 – Button',type:'text',group:'text'},
    {section_key:'__INST__3',field_key:'cta_link',label:'Paket 3 – Link',type:'link',group:'links'},
  ]},
];

const SECT_DESCRIPTIONS:Record<string,string>={
  'hero':'Überschrift, Unterzeile, CTA-Button und Hintergrundbild',
  'hero_legacy':'Überschrift, Unterzeile, CTA-Button und Hintergrundbild',
  'image_text_1':'Bild links, Überschrift, Beschreibungstext und Bullet-Points',
  'image_text_2':'Bild rechts, Überschrift und Beschreibungstext',
  'image_text':'Bild, Überschrift und Beschreibungstext',
  'quote':'Zitat mit Hintergrundbild',
  'quote_legacy':'Zitat mit Hintergrundbild',
  'flowing_text':'Farbiger Textblock über die gesamte Breite',
  'flowing_text_legacy':'Farbiger Textblock über die gesamte Breite',
  'final_cta':'Abschluss-Bereich mit Überschrift und Button',
  'final_cta_legacy':'Abschluss-Bereich mit Überschrift und Button',
  'logos':'Logostreifen mit Referenz-Logos',
  'logos_legacy':'Logostreifen mit Referenz-Logos',
  'feature_cards_3':'Drei Feature-Karten nebeneinander',
  'feature_cards_3_legacy':'Drei Feature-Karten nebeneinander',
  'feature_cards_4':'Vier Feature-Karten mit Überschrift',
  'feature_cards_4_legacy':'Vier Feature-Karten mit Überschrift',
  'reviews':'Kunden-Bewertungen und Testimonials',
  'reviews_legacy':'Kunden-Bewertungen und Testimonials',
  'about':'Portrait-Bild und persönlicher Text',
  'about_legacy':'Portrait-Bild und persönlicher Text',
  'video_carousel':'Horizontales Video-Karussell',
  'video_carousel_legacy':'Horizontales Video-Karussell',
  'testimonials':'Video-Testimonials von Schülern',
  'testimonials_legacy':'Video-Testimonials von Schülern',
  'quiz':'Interaktiver Quiz-Funnel zur Lead-Generierung',
  'component_quiz':'Quiz-Fragen, Formular und Farben',
  'component_header':'Logo, CTA-Button und Hintergrundfarbe',
  'component_footer':'Kontaktinfos, Links und Social Media',
  'component_cookie':'Cookie-Zustimmungsbanner',
  'danke_header':'Logo und Navigation der Danke-Seite',
  'danke_hero':'Bestätigungstext und Zurück-Button',
  'cta_banner':'Farbiger Banner mit Überschrift und Button',
  'stats_row':'Vier Kennzahlen nebeneinander',
  'faq':'Häufige Fragen als Akkordeon',
  'steps':'Schritt-für-Schritt Ablauf',
  'text_columns':'Zweispaltiger Textbereich',
  'image_fullwidth':'Vollbreites Bild mit optionalem Overlay-Text',
  'checklist':'Checkliste mit Häkchen-Punkten',
  'image_gallery':'Drei Bilder nebeneinander',
  'text_centered':'Zentrierter Textbereich mit Button',
  'pricing':'Drei Preis-Pakete im Vergleich',
  'global_colors':'Brand-Farbe und globale Farbpalette',
};

const SECT_MAP = Object.fromEntries(SECT_TYPES.map(s=>[s.type,s]));


// ── Visual Section Previews ───────────────────────────────────────────────────
function SectionPreview({type,content,instance}:{type:string;content:CM;instance:string}) {
  const ci=(inst:string,f:string)=>content[`${inst}::${f}`]||'';
  const cv=(sk:string,fk:string)=>content[`${sk}::${fk}`]||'';
  const brand=cv('colors','brand')||'#884A4A';
  const gray='#6B6B6B';

  // Normalize type for legacy variants
  const t=type.replace(/_legacy$/,'');

  const Pill=({label}:{label:string})=>(
    <div className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white" style={{backgroundColor:brand}}>{label}</div>
  );
  const MockBtn=({label}:{label:string})=>(
    <div className="inline-flex items-center rounded-[4px] px-3 py-1.5 text-[11px] font-bold text-white" style={{backgroundColor:brand}}>{label||'Button'}</div>
  );
  const MockImg=({src,className}:{src?:string;className?:string})=>src?(
    <div className={`overflow-hidden rounded-[4px] bg-neutral-100 ${className||''}`}><img src={src} className="h-full w-full object-cover" alt=""/></div>
  ):<div className={`rounded-[4px] bg-neutral-200 flex items-center justify-center text-neutral-400 text-[10px] ${className||''}`}>Kein Bild</div>;
  const Stars=()=><div className="flex gap-0.5">{[1,2,3,4,5].map(i=><span key={i} className="text-[#D4AF37] text-[10px]">★</span>)}</div>;

  const wrapClass="pointer-events-none select-none rounded-[4px] border border-dashed border-neutral-200 bg-neutral-50/60 p-3 mb-3 overflow-hidden";

  if(t==='hero') {
    const img=ci(instance,'image')||cv('images','hero');
    const title=ci(instance,'title')||cv('hero','title')||'Deine Überschrift';
    const cta=ci(instance,'cta_label')||cv('hero','cta_label')||'Jetzt anfragen';
    return(<div className={wrapClass}>
      <div className="relative h-20 overflow-hidden rounded-[4px]" style={{background:img?'#111':`linear-gradient(135deg,${brand}88,${brand}44)`}}>
        {img&&<img src={img} className="absolute inset-0 h-full w-full object-cover opacity-60" alt=""/>}
        <div className="absolute inset-x-0 bottom-0 p-2 text-center">
          <div className="text-[11px] font-extrabold text-white leading-tight line-clamp-2">{title}</div>
          <div className="mt-1.5"><MockBtn label={cta}/></div>
        </div>
      </div>
    </div>);
  }
  if(t==='image_text'||t==='image_text_1'||t==='image_text_2') {
    const img=ci(instance,'image')||cv('images','section1');
    const title=ci(instance,'title')||cv(instance,'title')||'Überschrift';
    return(<div className={wrapClass}>
      <div className="flex gap-2 items-center">
        <MockImg src={img} className="h-14 w-14 shrink-0"/>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-bold text-neutral-800 line-clamp-1">{title||'Überschrift'}</div>
          <div className="mt-0.5 space-y-0.5">{[1,2,3].map(i=><div key={i} className="flex items-center gap-1"><span className="h-2 w-2 rounded-full shrink-0" style={{backgroundColor:brand}}/><div className="h-1.5 w-20 rounded-full bg-neutral-200"/></div>)}</div>
          <div className="mt-1.5"><MockBtn label={ci(instance,'cta_label')||'Mehr erfahren'}/></div>
        </div>
      </div>
    </div>);
  }
  if(t==='quote') {
    const q=ci(instance,'quote')||cv('quote_section','quote')||'„Dein Zitat hier"';
    const bg=ci(instance,'bg')||cv('images','quote_bg');
    return(<div className={wrapClass}>
      <div className="relative rounded-[4px] overflow-hidden p-3" style={{background:bg?'#333':`${brand}dd`}}>
        {bg&&<img src={bg} className="absolute inset-0 h-full w-full object-cover opacity-30" alt=""/>}
        <p className="relative text-[11px] italic font-semibold text-white text-center line-clamp-2">"{q}"</p>
      </div>
    </div>);
  }
  if(t==='flowing_text') {
    const text=ci(instance,'text')||cv('flowing_text','text')||'Dein Fließtext...';
    return(<div className={wrapClass}>
      <div className="rounded-[4px] p-3" style={{backgroundColor:brand}}>
        <p className="text-[11px] text-white text-center font-medium line-clamp-2">{text}</p>
      </div>
    </div>);
  }
  if(t==='final_cta') {
    const title=ci(instance,'title')||cv('final_cta','title')||'Abschluss CTA';
    const img=ci(instance,'image')||cv('images','final_cta');
    return(<div className={wrapClass}>
      <div className="relative rounded-[4px] overflow-hidden p-3" style={{background:img?'#333':`${brand}bb`}}>
        {img&&<img src={img} className="absolute inset-0 h-full w-full object-cover opacity-30" alt=""/>}
        <div className="relative text-center">
          <div className="text-[11px] font-bold text-white line-clamp-1">{title}</div>
          <div className="mt-1.5"><MockBtn label={ci(instance,'cta_label')||'Jetzt anfragen'}/></div>
        </div>
      </div>
    </div>);
  }
  if(t==='logos'||t==='logos_legacy') {
    const label=ci(instance,'label')||cv('logos_section','label')||'Bekannt aus';
    return(<div className={wrapClass}>
      <div className="text-center">
        <div className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{color:brand}}>{label}</div>
        <div className="flex justify-center gap-2">{[1,2,3].map(i=><div key={i} className="h-8 w-16 rounded-[4px] border border-neutral-200 bg-white flex items-center justify-center"><div className="h-3 w-10 rounded bg-neutral-200"/></div>)}</div>
      </div>
    </div>);
  }
  if(t==='feature_cards_3'||t==='feature_cards_3_legacy') {
    return(<div className={wrapClass}>
      <div className="grid grid-cols-3 gap-1.5">
        {[1,2,3].map(i=>{
          const title=ci(instance+i,'title')||cv(`feature_card_${i}`,'title')||`Feature ${i}`;
          return(<div key={i} className="rounded-[4px] p-2 text-center text-white" style={{backgroundColor:brand}}>
            <div className="mx-auto mb-1 h-5 w-5 rounded bg-white/20"/>
            <div className="text-[9px] font-bold line-clamp-1">{title}</div>
          </div>);
        })}
      </div>
    </div>);
  }
  if(t==='feature_cards_4'||t==='feature_cards_4_legacy') {
    const title=ci(instance+'h','title')||cv('features_2_heading','title')||'Was dich erwartet';
    return(<div className={wrapClass}>
      <div className="text-[11px] font-bold text-center mb-2 line-clamp-1">{title}</div>
      <div className="grid grid-cols-4 gap-1">
        {[1,2,3,4].map(i=>{
          const t2=ci(instance+i,'title')||cv(`feature2_card_${i}`,'title')||`Punkt ${i}`;
          return(<div key={i} className="rounded-[4px] p-1.5 text-center text-white" style={{backgroundColor:brand}}>
            <div className="mx-auto mb-0.5 h-4 w-4 rounded bg-white/20"/>
            <div className="text-[8px] font-bold line-clamp-1">{t2}</div>
          </div>);
        })}
      </div>
    </div>);
  }
  if(t==='reviews'||t==='reviews_legacy') {
    return(<div className={wrapClass}>
      <div className="text-[11px] font-bold text-center mb-2">{ci(instance,'title')||cv('reviews','title')||'Stimmen'}</div>
      <div className="grid grid-cols-3 gap-1.5">
        {[1,2,3].map(i=>{
          const text=ci(instance+i,'text')||cv(`review_${i}`,'text')||'Bewertungstext...';
          return(<div key={i} className="rounded-[4px] bg-neutral-100 p-2">
            <Stars/>
            <p className="mt-0.5 text-[9px] line-clamp-2 text-neutral-600">{text}</p>
          </div>);
        })}
      </div>
    </div>);
  }
  if(t==='about'||t==='about_legacy') {
    const img=ci(instance,'image')||cv('images','about');
    const title=ci(instance,'title')||cv('about','title')||'Über mich';
    return(<div className={wrapClass}>
      <div className="flex gap-2 items-center">
        <div className="h-12 w-12 rounded-full shrink-0 overflow-hidden bg-neutral-200">{img&&<img src={img} className="h-full w-full object-cover" alt=""/>}</div>
        <div><div className="text-[11px] font-bold line-clamp-1">{title}</div><div className="mt-0.5 space-y-0.5">{[0,1,2].map(j=><div key={j} className="h-1.5 rounded-full bg-neutral-200" style={{width:`${70-j*15}%`}}/>)}</div></div>
      </div>
    </div>);
  }
  if(t==='video_carousel'||t==='video_carousel_legacy') {
    const title=ci(instance,'title')||cv('video_section','title')||'Videos';
    return(<div className={wrapClass}>
      <div className="text-[11px] font-bold mb-2">{title}</div>
      <div className="flex gap-1.5 overflow-hidden">{[1,2,3].map(i=><div key={i} className="h-12 w-20 shrink-0 rounded-[4px] bg-neutral-800 flex items-center justify-center"><span className="text-white text-[16px]">▶</span></div>)}</div>
    </div>);
  }
  if(t==='testimonials'||t==='testimonials_legacy') {
    return(<div className={wrapClass}>
      <div className="grid grid-cols-2 gap-1.5">
        {[1,2].map(i=><div key={i} className="rounded-[4px] bg-neutral-800 p-2 flex items-center justify-center"><span className="text-white text-[12px]">▶</span></div>)}
      </div>
    </div>);
  }
  if(t==='quiz') {
    const quizBg=ci(instance,'bg_color')||cv('colors','quiz_bg')||'#F7F7F7';
    return(<div className={wrapClass}>
      <div className="rounded-[4px] p-3" style={{backgroundColor:quizBg}}>
        <div className="text-[11px] font-bold text-center mb-1" style={{color:quizBg==='#F7F7F7'||quizBg.toLowerCase()==='#f7f7f7'?'#111':'#111'}}>Quiz</div>
        <div className="grid grid-cols-2 gap-1.5">{[1,2].map(i=><div key={i} className="h-8 rounded-[4px] border-2 border-neutral-300 bg-white"/>)}</div>
      </div>
    </div>);
  }
  // New section types
  if(t==='cta_banner') {
    const bg=ci(instance,'bg_color')||brand;
    return(<div className={wrapClass}>
      <div className="rounded-[4px] p-3 text-center" style={{backgroundColor:bg}}>
        <div className="text-[11px] font-bold text-white line-clamp-1">{ci(instance,'title')||'CTA Überschrift'}</div>
        <div className="mt-1.5"><MockBtn label={ci(instance,'cta_label')||'Jetzt starten'}/></div>
      </div>
    </div>);
  }
  if(t==='stats_row') return(<div className={wrapClass}>
    <div className="grid grid-cols-4 gap-1.5 text-center">
      {[1,2,3,4].map(i=><div key={i} className="rounded-[4px] p-2" style={{backgroundColor:brand+'11'}}>
        <div className="text-sm font-extrabold" style={{color:brand}}>{ci(instance,`stat_${i}_number`)||'100+'}</div>
        <div className="text-[9px] text-neutral-500">{ci(instance,`stat_${i}_label`)||`Statistik ${i}`}</div>
      </div>)}
    </div>
  </div>);
  if(t==='faq') return(<div className={wrapClass}>
    <div className="text-[11px] font-bold mb-2">{ci(instance,'title')||'Häufige Fragen'}</div>
    {[1,2,3].map(i=><div key={i} className="border-b border-neutral-200 py-1.5 flex items-center justify-between">
      <span className="text-[10px] text-neutral-700 line-clamp-1">{ci(instance+i,'question')||`Frage ${i}`}</span>
      <span className="text-neutral-300 text-xs">+</span>
    </div>)}
  </div>);
  if(t==='steps') return(<div className={wrapClass}>
    <div className="text-[11px] font-bold mb-2">{ci(instance,'title')||'So funktioniert es'}</div>
    <div className="space-y-1.5">{[1,2,3].map(i=><div key={i} className="flex items-center gap-2">
      <div className="h-5 w-5 shrink-0 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{backgroundColor:brand}}>{i}</div>
      <span className="text-[10px] text-neutral-700 line-clamp-1">{ci(instance+i,'title')||`Schritt ${i}`}</span>
    </div>)}</div>
  </div>);
  if(t==='text_columns') return(<div className={wrapClass}>
    <div className="text-[11px] font-bold text-center mb-2">{ci(instance,'title')||'Überschrift'}</div>
    <div className="grid grid-cols-2 gap-2">{['col_1','col_2'].map((col,i)=><div key={i}>
      <div className="text-[10px] font-bold mb-1">{ci(instance,`${col}_title`)||`Spalte ${i+1}`}</div>
      <div className="space-y-0.5">{[1,2,3].map(j=><div key={j} className="h-1.5 w-full rounded-full bg-neutral-200"/>)}</div>
    </div>)}</div>
  </div>);
  if(t==='image_fullwidth') {
    const img=ci(instance,'image');
    const title=ci(instance,'title');
    return(<div className={wrapClass}>
      <div className="relative h-16 rounded-[4px] overflow-hidden bg-neutral-200">
        {img&&<img src={img} className="absolute inset-0 h-full w-full object-cover" alt=""/>}
        {title&&<div className="absolute inset-0 flex items-center justify-center bg-black/40"><span className="text-[11px] font-bold text-white">{title}</span></div>}
      </div>
    </div>);
  }
  if(t==='checklist') return(<div className={wrapClass}>
    <div className="text-[11px] font-bold mb-2">{ci(instance,'title')||'Checkliste'}</div>
    <div className="space-y-1">{[1,2,3,4].map(i=><div key={i} className="flex items-center gap-1.5">
      <span className="h-3.5 w-3.5 shrink-0 rounded flex items-center justify-center text-white text-[9px]" style={{backgroundColor:brand}}>✓</span>
      <span className="text-[10px] text-neutral-700 line-clamp-1">{ci(instance+i,'item')||`Punkt ${i}`}</span>
    </div>)}</div>
  </div>);
  if(t==='image_gallery') return(<div className={wrapClass}>
    <div className="text-[11px] font-bold mb-2">{ci(instance,'title')||'Galerie'}</div>
    <div className="grid grid-cols-3 gap-1.5">{[1,2,3].map(i=><div key={i}>
      <MockImg src={ci(instance+i,'image')} className="h-14 w-full"/>
      {ci(instance+i,'caption')&&<div className="mt-0.5 text-[9px] text-center text-neutral-500 line-clamp-1">{ci(instance+i,'caption')}</div>}
    </div>)}</div>
  </div>);
  if(t==='text_centered') return(<div className={wrapClass}>
    <div className="text-center">
      {ci(instance,'label')&&<div className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{color:brand}}>{ci(instance,'label')}</div>}
      <div className="text-[11px] font-bold line-clamp-1">{ci(instance,'title')||'Überschrift'}</div>
      <div className="mt-0.5 space-y-0.5 mb-2">{[1,2].map(j=><div key={j} className="h-1.5 rounded-full bg-neutral-200 mx-auto" style={{width:`${80-j*20}%`}}/>)}</div>
      <MockBtn label={ci(instance,'cta_label')||'Mehr erfahren'}/>
    </div>
  </div>);
  if(t==='pricing') return(<div className={wrapClass}>
    <div className="text-[11px] font-bold text-center mb-2">{ci(instance,'title')||'Preisübersicht'}</div>
    <div className="grid grid-cols-3 gap-1.5">{[1,2,3].map(i=><div key={i} className={`rounded-[4px] p-2 text-center border ${i===2?'border-2':'border-neutral-200'}`} style={i===2?{borderColor:brand}:{}}>
      <div className="text-[9px] font-bold mb-0.5">{ci(instance+i,'name')||`Paket ${i}`}</div>
      <div className="text-sm font-extrabold" style={{color:brand}}>{ci(instance+i,'price')||'€99'}</div>
    </div>)}</div>
  </div>);
  // Fallback
  return(<div className={`${wrapClass} text-center`}>
    <div className="text-[10px] text-neutral-400 py-2">Vorschau nicht verfügbar</div>
  </div>);
}

function SectionRow({section,content,dirty,onChange,onUpload,onToggleHide,isDragging,onDragStart,onDragOver,onDrop,onDragEnd,onDelete}:{
  section:SectInstance;content:CM;dirty:Set<string>;
  onChange:(key:string,val:string)=>void;
  onUpload:(file:File)=>Promise<string>;
  onToggleHide:()=>void;isDragging:boolean;
  onDragStart:()=>void;onDragOver:(e:React.DragEvent)=>void;onDrop:()=>void;onDragEnd:()=>void;
  onDelete:()=>void;
}) {
  const [open,setOpen]=useState(false);
  const [openGroups,setOpenGroups]=useState<Record<string,boolean>>({});
  // Modern section_instance is generated as `${section_type}_${Date.now().toString(36)}` (7+ chars base36) optionally with `_${random4}`
  // Legacy instances are static human-readable strings like 'hero', 'header', 'quiz_section', 'danke_header', etc.
  const modernPattern = /^.+_[a-z0-9]{7,}(_[a-z0-9]{2,})?$/;
  const isLeg = !modernPattern.test(section.section_instance);
  const LEG:Record<string,string>={hero:'hero_legacy',logos:'logos_legacy',feature_cards_3:'feature_cards_3_legacy',feature_cards_4:'feature_cards_4_legacy',quote:'quote_legacy',video_carousel:'video_carousel_legacy',flowing_text:'flowing_text_legacy',testimonials:'testimonials_legacy',about:'about_legacy',reviews:'reviews_legacy',final_cta:'final_cta_legacy'};
  const rt=isLeg&&LEG[section.section_type]?LEG[section.section_type]:section.section_type;
  const def=SECT_MAP[rt]??SECT_MAP[section.section_type];
  const fields=def?.fields??[];
  const hasDirty=fields.some(f=>dirty.has(resolveKey(f,section.section_instance)));

  const grouped=fields.reduce<Record<string,Field[]>>((acc,f)=>{const g=f.group||'text';if(!acc[g])acc[g]=[];acc[g].push(f);return acc;},{});
  const gKeys=Object.keys(grouped);

  useEffect(()=>{
    if(open&&gKeys.length>0&&Object.keys(openGroups).length===0){
      const init:Record<string,boolean>={};gKeys.forEach(g=>{init[g]=true;});setOpenGroups(init);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[open]);

  return (
    <div draggable onDragStart={onDragStart} onDragOver={onDragOver} onDrop={onDrop} onDragEnd={onDragEnd}
      className={`rounded-[4px] border transition ${isDragging?'opacity-40 scale-[0.98]':''} ${section.hidden?'border-dashed border-neutral-200 bg-neutral-50/50':'border-neutral-200 bg-white'}`}>
      <div className="flex items-center gap-2 px-4 py-3">
        <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-neutral-300 hover:text-neutral-400"/>
        <button type="button" onClick={()=>setOpen(v=>!v)} className="flex flex-1 items-center gap-2 text-left min-w-0">
          {open?<ChevronDown className="h-4 w-4 shrink-0 text-neutral-400"/>:<ChevronRight className="h-4 w-4 shrink-0 text-neutral-400"/>}
          <span className="flex min-w-0 flex-col gap-0">
            <span className={`truncate text-sm font-semibold leading-tight ${section.hidden?'text-neutral-400 line-through':'text-neutral-800'}`}>{section.label}</span>
            {!open&&<span className="truncate text-[11px] text-neutral-400 leading-tight">{SECT_DESCRIPTIONS[section.section_type]||SECT_DESCRIPTIONS[section.section_type.replace(/_legacy$/,'')]||'Inhalt dieser Sektion bearbeiten'}</span>}
          </span>
          {hasDirty&&<DirtyBadge/>}
          {fields.length===0&&<span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] text-neutral-400">keine Felder</span>}
        </button>
        <div className="flex shrink-0 items-center gap-0.5">

          <button type="button" onClick={onToggleHide} title={section.hidden?'Einblenden':'Ausblenden'} className="flex h-7 w-7 items-center justify-center rounded text-neutral-300 transition hover:bg-neutral-100 hover:text-[#884A4A]">
            {section.hidden?<Eye className="h-3.5 w-3.5"/>:<EyeOff className="h-3.5 w-3.5"/>}
          </button>
          <button type="button" onClick={onDelete} title="Löschen" className="flex h-7 w-7 items-center justify-center rounded text-neutral-300 transition hover:bg-red-50 hover:text-red-500">
            <Trash2 className="h-3.5 w-3.5"/>
          </button>
        </div>
      </div>
      {open&&fields.length>0&&(
        <div className="border-t border-neutral-100 px-4 py-3 space-y-2">
          <SectionPreview type={section.section_type} content={content} instance={section.section_instance}/>
          {gKeys.map(gKey=>{
            const gm=GROUP_META[gKey]||{label:gKey,color:'#6B7280'};
            const gf=grouped[gKey];
            const gOpen=openGroups[gKey]!==false;
            const gDirty=gf.some(f=>dirty.has(resolveKey(f,section.section_instance)));
            return (
              <div key={gKey} className="rounded-[4px] border border-neutral-100 overflow-hidden">
                <button type="button" onClick={()=>setOpenGroups(p=>({...p,[gKey]:!p[gKey]}))}
                  className="flex w-full items-center gap-2 px-3 py-2 bg-neutral-50 hover:bg-neutral-100 transition text-left">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{backgroundColor:gm.color}}/>
                  <span className="text-xs font-semibold text-neutral-600">{gm.label}</span>
                  {gDirty&&<DirtyBadge/>}
                  <span className="ml-auto text-neutral-300">{gOpen?<ChevronDown className="h-3.5 w-3.5"/>:<ChevronRight className="h-3.5 w-3.5"/>}</span>
                </button>
                {gOpen&&(
                  <div className="px-4 py-4 space-y-5">
                    {gf.map(rawField=>{
                      const key=resolveKey(rawField,section.section_instance);
                      const val=content[key]??'';
                      const iD=dirty.has(key);
                      if(rawField.field_key==='quiz_id') return <QuizSelectorField key={key} value={val} isDirty={iD} onChange={v=>onChange(key,v)}/>;
                      if(rawField.type==='color') return <ColorField key={key} label={rawField.label} hint={rawField.hint} value={val} isDirty={iD} onChange={v=>onChange(key,v)}/>;
                      if(rawField.type==='image'||rawField.type==='video') return <MediaField key={key} label={rawField.label} hint={rawField.hint} type={rawField.type} value={val} isDirty={iD} onChange={v=>onChange(key,v)} onUpload={onUpload}/>;
                      return <TextField key={key} label={rawField.label} hint={rawField.hint} type={rawField.type} value={val} isDirty={iD} onChange={v=>onChange(key,v)}/>;
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Modal({title,onClose,children}:{title:string;onClose:()=>void;children:React.ReactNode}) {
  const ref=useRef<HTMLDivElement>(null);
  useEffect(()=>{const h=(e:MouseEvent)=>{if(ref.current&&!ref.current.contains(e.target as Node))onClose();};document.addEventListener('mousedown',h);return()=>document.removeEventListener('mousedown',h);},[onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div ref={ref} className="w-full max-w-md rounded-[4px] border border-neutral-200 bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between"><h3 className="font-bold text-neutral-800">{title}</h3><button onClick={onClose} className="text-neutral-400 hover:text-neutral-600"><X className="h-4 w-4"/></button></div>
        {children}
      </div>
    </div>
  );
}

function AddSectionDialog({onAdd,onClose}:{onAdd:(type:string,label:string)=>void;onClose:()=>void}) {
  const [sel,setSel]=useState('');
  const add=SECT_TYPES.filter(s=>s.addable);
  return (
    <Modal title="Sektion hinzufügen" onClose={onClose}>
      <div className="max-h-72 overflow-y-auto space-y-1 mb-4">
        {add.map(t=>(
          <button key={t.type} type="button" onClick={()=>setSel(t.type)}
            className={`flex w-full items-center justify-between rounded-[4px] px-3 py-2.5 text-sm text-left transition hover:bg-[#FDF8F8] ${sel===t.type?'bg-[#FDF8F8] font-semibold text-[#884A4A]':'text-neutral-800'}`}>
            <span>{t.label}</span>
            <div className="flex items-center gap-2"><span className="text-[10px] text-neutral-400">{t.fields.length} Felder</span>{sel===t.type&&<CheckCircle className="h-4 w-4 text-[#884A4A]"/>}</div>
          </button>
        ))}
      </div>
      <button onClick={()=>{if(sel){onAdd(sel,SECT_MAP[sel]?.label||sel);onClose();}}} disabled={!sel} className="w-full h-10 rounded-[4px] text-sm font-semibold text-white disabled:opacity-40" style={{backgroundColor:brand}}>Sektion hinzufügen</button>
    </Modal>
  );
}

function FontPanel({currentFont,onSave}:{currentFont:string;onSave:(f:string)=>void}) {
  const [sel,setSel]=useState(currentFont);const [saving,setSaving]=useState(false);
  useEffect(()=>{setSel(currentFont);},[currentFont]);
  // Preload all font stylesheets so previews render correctly
  useEffect(()=>{
    GOOGLE_FONTS.forEach(f=>{
      if(!document.querySelector(`link[href="${f.url}"]`)){
        const link=document.createElement('link');link.rel='stylesheet';link.href=f.url;document.head.appendChild(link);
      }
    });
  },[]);
  const selFont=GOOGLE_FONTS.find(f=>f.name===sel)||GOOGLE_FONTS[0];
  const save=async()=>{setSaving(true);await fetch('/api/admin/font-settings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({font:sel,url:selFont.url})});setSaving(false);onSave(sel);};
  return (
    <div className="rounded-[4px] border border-neutral-200 bg-white p-5 space-y-4 shadow-sm">
      <div className="flex items-center gap-2"><Type className="h-4 w-4 text-neutral-400"/><h3 className="font-bold text-neutral-800 text-sm">Globale Schriftart</h3><span className="ml-auto text-xs text-neutral-400">Gilt für alle öffentlichen Seiten</span></div>
      <div className="grid grid-cols-1 gap-1.5 max-h-64 overflow-y-auto pr-1">
        {GOOGLE_FONTS.map(f=>(
          <button key={f.name} type="button" onClick={()=>setSel(f.name)}
            className={`rounded-[4px] border px-4 py-2.5 text-left transition flex items-center gap-3 ${sel===f.name?'border-[#884A4A] bg-[#FDF8F8]':'border-neutral-100 hover:border-neutral-300 hover:bg-neutral-50'}`}>
            <span className={`text-xs w-24 shrink-0 ${sel===f.name?'font-semibold text-[#884A4A]':'text-neutral-400'}`}>{f.name}</span>
            <span className="text-sm text-neutral-700" style={{fontFamily:f.name}}>{f.preview}</span>
            {sel===f.name&&<CheckCircle className="h-3.5 w-3.5 shrink-0 ml-auto text-[#884A4A]"/>}
          </button>
        ))}
      </div>
      <div className="rounded-[4px] bg-neutral-50 border border-neutral-100 px-4 py-3">
        <p className="text-[10px] uppercase tracking-wider text-neutral-400 mb-2">Vorschau — {sel}</p>
        <p className="text-xl font-bold leading-tight" style={{fontFamily:sel}}>Sing freier, sicherer</p>
        <p className="text-sm text-neutral-500 mt-1" style={{fontFamily:sel}}>und mit mehr Ausdruck durch die Voiceation Methode.</p>
      </div>
      <button onClick={save} disabled={saving} className="h-10 w-full rounded-[4px] text-sm font-semibold text-white disabled:opacity-40 flex items-center justify-center gap-2" style={{backgroundColor:brand}}>
        {saving?<Loader2 className="h-4 w-4 animate-spin"/>:<Save className="h-4 w-4"/>}{saving?'Wird gespeichert...':'Schriftart übernehmen'}
      </button>
    </div>
  );
}

const COMPONENT_PAGES: CmsPage[] = [
  {id:'component_header',label:'Header',path:'(Komponente)',is_system:true},
  {id:'component_footer',label:'Footer',path:'(Komponente)',is_system:true},
  {id:'component_cookie',label:'Cookie Banner',path:'(Komponente)',is_system:true},
  {id:'component_quiz',label:'Quiz (Standard)',path:'(Komponente)',is_system:true},
];
const COMPONENT_SECTIONS: Record<string,SectInstance> = {
  'component_header':{id:'virtual_header',page_id:'component_header',section_instance:'header',section_type:'component_header',label:'Header',sort_order:0,hidden:false},
  'component_footer':{id:'virtual_footer',page_id:'component_footer',section_instance:'footer',section_type:'component_footer',label:'Footer',sort_order:0,hidden:false},
  'component_cookie':{id:'virtual_cookie',page_id:'component_cookie',section_instance:'cookie',section_type:'component_cookie',label:'Cookie Banner',sort_order:0,hidden:false},
  'component_quiz':{id:'virtual_quiz',page_id:'component_quiz',section_instance:'quiz_section',section_type:'component_quiz',label:'Quiz Einstellungen',sort_order:0,hidden:false},
};

export default function CmsPage() {
  const [pages,setPages]=useState<CmsPage[]>([]);
  const [selectedPage,setSelectedPage]=useState<CmsPage|null>(null);
  const [sections,setSections]=useState<SectInstance[]>([]);
  const [content,setContent]=useState<CM>({});
  const [dirty,setDirty]=useState<Set<string>>(new Set());
  const [saving,setSaving]=useState(false);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [savedAt,setSavedAt]=useState<Date|null>(null);
  const [pageDropOpen,setPageDropOpen]=useState(false);
  const [showAddSection,setShowAddSection]=useState(false);
  const [showFontPanel,setShowFontPanel]=useState(false);
  const [currentFont,setCurrentFont]=useState('Open Sans');
  const [headerEnabled,setHeaderEnabled]=useState(true);
  const [footerEnabled,setFooterEnabled]=useState(true);
  const draggingId=useRef<string|null>(null);
  const pageDropRef=useRef<HTMLDivElement>(null);

  useEffect(()=>{
    const h=(e:MouseEvent)=>{if(pageDropRef.current&&!pageDropRef.current.contains(e.target as Node))setPageDropOpen(false);};
    document.addEventListener('mousedown',h);return()=>document.removeEventListener('mousedown',h);
  },[]);

  useEffect(()=>{
    fetch('/api/admin/font-settings').then(r=>r.json()).then(j=>{if(j.font)setCurrentFont(j.font);}).catch(()=>{});
  },[]);

  useEffect(()=>{
    fetch('/api/admin/pages').then(r=>r.json()).then(j=>{
      if(j.ok&&j.data?.length){
        fetch('/api/admin/quiz-configs').then(r2=>r2.json()).then(j2=>{
          const qv:CmsPage[]=(j2.data||[]).filter((q:any)=>q.id!=='component_quiz').map((q:any)=>({...q,path:'(Quiz-Variante)',is_system:false}));
          setPages([...j.data,...COMPONENT_PAGES,...qv]);setSelectedPage(j.data[0]);
        }).catch(()=>{setPages([...j.data,...COMPONENT_PAGES]);setSelectedPage(j.data[0]);});
      }
    }).catch(()=>{});
  },[]);

  const isComp=(pid:string)=>pid.startsWith('component_');
  const isQuiz=(pid:string)=>pid.startsWith('quiz_');

  const loadPage=useCallback(async(page:CmsPage)=>{
    setLoading(true);setError('');setDirty(new Set());
    setHeaderEnabled(true);setFooterEnabled(true);
    try {
      if(isComp(page.id)&&!isQuiz(page.id)){
        const vs=COMPONENT_SECTIONS[page.id];setSections(vs?[vs]:[]);
        const cR=await fetch(`/api/admin/content?page=${page.id}`).then(r=>r.json());
        if(cR.ok){const map:CM={};for(const e of(cR.data||[]))map[`${e.section_key}::${e.field_key}`]=e.value;setContent(map);}
      } else if(isQuiz(page.id)){
        const vs:SectInstance={id:'virtual_quiz_'+page.id,page_id:page.id,section_instance:'quiz_section',section_type:'component_quiz',label:page.label,sort_order:0,hidden:false};
        setSections([vs]);
        const cR=await fetch(`/api/admin/content?page=${page.id}`).then(r=>r.json());
        if(cR.ok){const map:CM={};for(const e of(cR.data||[]))map[`${e.section_key}::${e.field_key}`]=e.value;setContent(map);}
      } else {
        const [sR,cR]=await Promise.all([fetch(`/api/admin/sections?page_id=${page.id}`).then(r=>r.json()),fetch(`/api/admin/content?page=${page.id}`).then(r=>r.json())]);
        setSections(sR.ok?sR.data||[]:[]);
        if(cR.ok){const map:CM={};for(const e of(cR.data||[]))map[`${e.section_key}::${e.field_key}`]=e.value;setContent(map);
          // Load header/footer state from layout settings in content
          const showH=(cR.data||[]).find((e:any)=>e.section_key==='layout'&&e.field_key==='show_header');
          const showF=(cR.data||[]).find((e:any)=>e.section_key==='layout'&&e.field_key==='show_footer');
          setHeaderEnabled(showH?showH.value!=='false':true);
          setFooterEnabled(showF?showF.value!=='false':true);
        }
      }
    } catch(e:any){setError(e.message);}
    finally{setLoading(false);}
  },[]);

  useEffect(()=>{if(selectedPage)loadPage(selectedPage);},[selectedPage,loadPage]);

  const handleChange=(key:string,val:string)=>{setContent(p=>({...p,[key]:val}));setDirty(p=>new Set([...p,key]));};
  const handleUpload=async(file:File):Promise<string>=>{const form=new FormData();form.append('file',file);const res=await fetch('/api/admin/upload',{method:'POST',body:form});const json=await res.json();if(!json.ok)throw new Error(json.error);return json.url;};

  const handleSave=async()=>{
    if(!selectedPage)return;setSaving(true);setError('');
    try {
      const cKeys=Array.from(dirty).filter(k=>!k.startsWith('__'));
      if(cKeys.length){
        const updates=cKeys.map(key=>{const[sk,fk]=key.split('::');return{section_key:sk,field_key:fk,value:content[key]??''};});
        const res=await fetch('/api/admin/content',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({page:selectedPage.id,updates})});
        if(!(await res.json()).ok)throw new Error('Content-Fehler');
      }
      if(!isComp(selectedPage.id)&&!isQuiz(selectedPage.id)){
        await fetch('/api/admin/sections',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({page_id:selectedPage.id,updates:sections.map((s,i)=>({id:s.id,sort_order:i,hidden:s.hidden})),settings:{header_enabled:headerEnabled,footer_enabled:footerEnabled}})});
      }
      setDirty(new Set());setSavedAt(new Date());
    } catch(e:any){setError(e.message);}
    finally{setSaving(false);}
  };

  const toggleHide=(id:string)=>{setSections(p=>p.map(s=>s.id===id?{...s,hidden:!s.hidden}:s));setDirty(p=>new Set([...p,'__order__']));};

  const onDragStart=(id:string)=>{draggingId.current=id;};
  const onDragOver=(e:React.DragEvent)=>{
    e.preventDefault();
    const ZONE=100;const{clientY}=e;const{innerHeight}=window;
    if(clientY<ZONE)window.scrollBy({top:-12,behavior:'smooth'});
    if(clientY>innerHeight-ZONE)window.scrollBy({top:12,behavior:'smooth'});
  };
  const onDrop=(toId:string)=>{
    const from=draggingId.current;if(!from||from===toId)return;
    setSections(p=>{const n=[...p];const fi=n.findIndex(s=>s.id===from),ti=n.findIndex(s=>s.id===toId);const[item]=n.splice(fi,1);n.splice(ti,0,item);return n;});
    setDirty(p=>new Set([...p,'__order__']));
  };
  const onDragEnd=()=>{draggingId.current=null;};


  const deleteSection=async(s:SectInstance)=>{
    if(!confirm(`Sektion "${s.label}" wirklich löschen?`))return;
    await fetch('/api/admin/sections',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:s.id,page_id:selectedPage?.id,section_instance:s.section_instance})});
    setSections(p=>p.filter(x=>x.id!==s.id));
  };

  const addSection=async(type:string,label:string)=>{
    if(!selectedPage)return;
    try {
      const res=await fetch('/api/admin/sections',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({page_id:selectedPage.id,section_type:type,label})});
      const json=await res.json();
      if(json.ok){
        setSections(p=>[...p,json.data]);
        // Also seed default content for this section type so it's immediately editable
        const def=SECT_MAP[type];
        if(def){
          const instance=json.data.section_instance;
          const seeds:Array<{section_key:string;field_key:string;value:string}>=[];
          def.fields.forEach(f=>{
            const sk=f.section_key.replace(/__INST__/g,instance);
            seeds.push({section_key:sk,field_key:f.field_key,value:''});
          });
          if(seeds.length){
            await fetch('/api/admin/content',{method:'POST',headers:{'Content-Type':'application/json'},
              body:JSON.stringify({page:selectedPage.id,updates:seeds})});
          }
        }
      } else {
        setError(json.error||'Sektion konnte nicht hinzugefügt werden');
      }
    } catch(e:any){setError(e.message);}
  };

  const totalDirty=dirty.size;
  const isNormal=selectedPage&&!isComp(selectedPage.id)&&!isQuiz(selectedPage.id);
  const realPages=pages.filter(p=>!p.id.startsWith('component_')&&!p.id.startsWith('quiz_'));
  const compPages=pages.filter(p=>p.id.startsWith('component_'));
  const quizPages=pages.filter(p=>p.id.startsWith('quiz_'));

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=${encodeURIComponent(currentFont)}:wght@400;600;700;800&display=swap'); *{font-family:'${currentFont}',sans-serif!important}`}</style>

      <div className="space-y-5 pb-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-neutral-800">Content bearbeiten</h1>
            <p className="mt-0.5 text-sm text-neutral-400">Seiten und Sektionen verwalten, Inhalte live schalten.</p>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={()=>setShowFontPanel(v=>!v)} className="flex h-9 items-center gap-1.5 rounded-[4px] border border-neutral-200 px-3 text-sm text-neutral-600 transition hover:bg-neutral-50">
              <Type className="h-4 w-4"/> Schriftart
            </button>
            {savedAt&&totalDirty===0&&<span className="flex items-center gap-1.5 text-sm text-emerald-600"><CheckCircle className="h-4 w-4"/>{savedAt.toLocaleTimeString('de-AT',{hour:'2-digit',minute:'2-digit'})} gespeichert</span>}
            {totalDirty>0&&<span className="flex items-center gap-1.5 text-sm text-amber-600"><AlertCircle className="h-4 w-4"/>{totalDirty} ungespeichert</span>}
            <button onClick={handleSave} disabled={saving||totalDirty===0} className="flex items-center gap-2 rounded-[4px] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-40" style={{backgroundColor:brand}}>
              {saving?<Loader2 className="h-4 w-4 animate-spin"/>:<Save className="h-4 w-4"/>}{saving?'Speichern...':'Speichern & live'}
            </button>
          </div>
        </div>

        {showFontPanel&&<FontPanel currentFont={currentFont} onSave={f=>{setCurrentFont(f);setShowFontPanel(false);}}/>}

        <div className="flex flex-wrap items-center gap-2">
          <div ref={pageDropRef} className="relative">
            <button type="button" onClick={()=>setPageDropOpen(v=>!v)}
              className={`flex h-10 items-center gap-2 rounded-[4px] border bg-white px-3.5 text-sm font-semibold text-neutral-700 shadow-sm transition ${pageDropOpen?'border-[#884A4A] ring-2 ring-[#884A4A]/10':'border-neutral-200 hover:border-neutral-300'}`}>
              <Globe className="h-4 w-4 text-neutral-400 shrink-0"/>
              <span className="max-w-[160px] truncate">{selectedPage?.label??'Seite wählen'}</span>
              {selectedPage&&<span className="rounded-md bg-neutral-100 px-1.5 py-0.5 text-[10px] text-neutral-400 font-normal font-mono truncate max-w-[100px]">{selectedPage.path}</span>}
              <ChevronDown className={`h-4 w-4 text-neutral-400 transition-transform duration-150 shrink-0 ${pageDropOpen?'rotate-180':''}`}/>
            </button>
            {pageDropOpen&&(
              <div className="absolute left-0 top-full z-50 mt-1.5 min-w-[300px] overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-xl">
                {realPages.length>0&&<>
                  <div className="px-3 pt-3 pb-1.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Seiten</div>
                  {realPages.map(p=>(
                    <div key={p.id} onClick={()=>{setSelectedPage(p);setPageDropOpen(false);}} className={`group flex cursor-pointer items-center gap-2.5 px-3 py-2.5 transition ${selectedPage?.id===p.id?'bg-[#FDF8F8]':'hover:bg-neutral-50'}`}>
                      <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${selectedPage?.id===p.id?'bg-[#884A4A]/10':'bg-neutral-100'}`}>
                        <FileText className={`h-3.5 w-3.5 ${selectedPage?.id===p.id?'text-[#884A4A]':'text-neutral-400'}`}/>
                      </div>
                      <span className={`flex-1 min-w-0 truncate text-sm ${selectedPage?.id===p.id?'font-semibold text-[#884A4A]':'font-medium text-neutral-700'}`}>{p.label}</span>
                      <span className="font-mono text-[10px] text-neutral-400 shrink-0">{p.path}</span>
                    </div>
                  ))}
                </>}

                {compPages.length>0&&<>
                  <div className="mx-3 my-1 border-t border-neutral-100"/>
                  <div className="px-3 pt-1.5 pb-1.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Komponenten</div>
                  {compPages.map(p=>(
                    <div key={p.id} onClick={()=>{setSelectedPage(p);setPageDropOpen(false);}} className={`group flex cursor-pointer items-center gap-2.5 px-3 py-2.5 transition ${selectedPage?.id===p.id?'bg-[#FDF8F8]':'hover:bg-neutral-50'}`}>
                      <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${selectedPage?.id===p.id?'bg-[#884A4A]/10':'bg-neutral-100'}`}>
                        <Layout className={`h-3.5 w-3.5 ${selectedPage?.id===p.id?'text-[#884A4A]':'text-neutral-400'}`}/>
                      </div>
                      <span className={`flex-1 min-w-0 truncate text-sm ${selectedPage?.id===p.id?'font-semibold text-[#884A4A]':'font-medium text-neutral-700'}`}>{p.label}</span>
                    </div>
                  ))}
                </>}
              </div>
            )}
          </div>
          {selectedPage&&isNormal&&(
            <a href={selectedPage.path} target="_blank" rel="noopener noreferrer" className="flex h-10 items-center gap-1.5 rounded-[4px] border border-neutral-200 px-3 text-sm text-neutral-500 transition hover:bg-neutral-50">
              <Eye className="h-4 w-4"/> Live ansehen <ArrowRight className="h-3.5 w-3.5"/>
            </a>
          )}
        </div>

        {isNormal&&(
          <div className="flex items-center gap-5 rounded-[4px] border border-neutral-200 bg-white px-4 py-3">
            <span className="text-sm font-semibold text-neutral-600">Sichtbar auf dieser Seite:</span>
            {([['Header',headerEnabled,setHeaderEnabled],['Footer',footerEnabled,setFooterEnabled]] as const).map(([lbl,val,setter])=>(
              <label key={lbl} className="flex cursor-pointer items-center gap-2.5 select-none">
                <button type="button" role="switch" aria-checked={val} onClick={()=>{(setter as (v:boolean)=>void)(!val);setDirty(p=>new Set([...p,'__settings__']));}}
                  className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none ${val?'bg-[#884A4A]':'bg-neutral-200'}`}>
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200 ${val?'translate-x-[18px]':'translate-x-[3px]'}`}/>
                </button>
                <span className="text-sm text-neutral-700">{lbl}</span>
              </label>
            ))}
          </div>
        )}

        {error&&<div className="flex items-center gap-2 rounded-[4px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0"/> {error}<button className="ml-auto underline" onClick={()=>setError('')}>OK</button></div>}

        {loading?(
          <div className="flex h-48 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" style={{color:brand}}/></div>
        ):(
          <div className="space-y-2">
            {sections.map(section=>(
              <SectionRow key={section.id} section={section} content={content} dirty={dirty}
                onChange={handleChange} onUpload={handleUpload} onToggleHide={()=>toggleHide(section.id)}
                isDragging={draggingId.current===section.id}
                onDragStart={()=>onDragStart(section.id)} onDragOver={onDragOver}
                onDrop={()=>onDrop(section.id)} onDragEnd={onDragEnd}
                onDelete={()=>deleteSection(section)}/>
            ))}
            {isNormal&&(
              <button type="button" onClick={()=>setShowAddSection(true)} className="flex w-full items-center justify-center gap-2 rounded-[4px] border-2 border-dashed border-neutral-200 py-4 text-sm font-medium text-neutral-400 transition hover:border-[#884A4A] hover:text-[#884A4A]">
                <Plus className="h-4 w-4"/> Sektion hinzufügen
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
