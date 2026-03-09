'use client';
// src/app/admin/cms/page.tsx — Enhanced CMS with grouped fields, bold/italic, font selector, header/footer toggle, quiz management

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Save, CheckCircle, AlertCircle, Loader2, Upload, Eye, EyeOff,
  ChevronDown, ChevronRight, Palette, Image as ImageIcon, Video,
  Link as LinkIcon, Type, GripVertical, FileText, Plus, Trash2,
  Globe, X, ArrowRight, Layout, Settings,
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

function TextField({ label, hint, type, value, isDirty, onChange }: { label: string; hint?: string; type: 'text'|'textarea'|'link'; value: string; isDirty: boolean; onChange: (v: string)=>void }) {
  const border={borderColor:isDirty?'#F59E0B':'#E5E7EB'};
  const icon=type==='link'?<LinkIcon className="h-3.5 w-3.5 text-neutral-400"/>:<Type className="h-3.5 w-3.5 text-neutral-400"/>;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm font-semibold text-neutral-800">{label}</span>
        {type==='link'&&<span className="rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">Link</span>}
        {isDirty&&<DirtyBadge/>}
      </div>
      {hint&&<p className="pl-5 text-xs text-neutral-400">{hint}</p>}
      <div className="pl-5">
        {type==='textarea'?(
          <textarea value={value} onChange={e=>onChange(e.target.value)} rows={3}
            className="w-full resize-y rounded-[4px] border px-3 py-2 text-sm outline-none focus:border-[#884A4A]" style={border}/>
        ):type==='link'?(
          <div className="flex gap-2">
            <input type="text" value={value} onChange={e=>onChange(e.target.value)} placeholder="#quiz oder https://..."
              className="h-10 flex-1 rounded-[4px] border px-3 font-mono text-sm outline-none focus:border-[#884A4A]" style={border}/>
            {value&&<a href={value} target={value.startsWith('http')?'_blank':'_self'} rel="noopener noreferrer"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[4px] border border-neutral-200 text-neutral-400 hover:bg-neutral-50">
              <Eye className="h-4 w-4"/>
            </a>}
          </div>
        ):(
          <input type="text" value={value} onChange={e=>onChange(e.target.value)}
            className="h-10 w-full rounded-[4px] border px-3 text-sm outline-none focus:border-[#884A4A]" style={border}/>
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
    {section_key:'__INST__',field_key:'bg_color',label:'Hintergrundfarbe der Sektion',type:'color',group:'colors'},
  ]},
  // global_colors is managed via the Farben panel in the toolbar, not as a section
  {type:'global_colors',label:'Globale Farben',addable:false,fields:[]},
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
  {type:'component_topbar',label:'Ankündigungsleiste',addable:false,fields:[
    {section_key:'header',field_key:'topbar_text',label:'Text',type:'text',group:'text'},
    {section_key:'header',field_key:'topbar_bg',label:'Hintergrundfarbe',type:'color',group:'colors'},
    {section_key:'header',field_key:'topbar_color',label:'Textfarbe',type:'color',group:'colors'},
    {section_key:'header',field_key:'show_topbar',label:'Sichtbar (true/false)',type:'text',group:'settings',hint:'true oder false'},
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
  // 'header' on pages has no editable fields — editing happens in the Header component
  {type:'header',label:'Header',addable:false,fields:[]},
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
  // danke_header: no editable fields — uses global header component
  {type:'danke_header',label:'Header',addable:false,fields:[]},
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
  'component_topbar':'Schmal einblendbare Ankündigungsleiste oben auf der Seite',
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


// ── Visual Section Previews ─────────────────────────────────────────────────
// Renders a pixel-accurate miniature replica of each section.
// A ResizeObserver measures the actual container width at runtime so the
// CSS scale() transform fills it exactly — no guesswork, no fixed ratios.
function SectionPreview({type,content,instance}:{type:string;content:CM;instance:string}) {
  const containerRef=React.useRef<HTMLDivElement>(null);
  const [containerW,setContainerW]=React.useState(0);
  React.useEffect(()=>{
    const el=containerRef.current;if(!el)return;
    const obs=new ResizeObserver(([e])=>{const w=e.contentRect.width;if(w>0)setContainerW(Math.round(w));});
    obs.observe(el);setContainerW(el.getBoundingClientRect().width||0);
    return()=>obs.disconnect();
  },[]);

  const ci=(inst:string,f:string)=>content[`${inst}::${f}`]||'';
  const cv=(sk:string,fk:string)=>content[`${sk}::${fk}`]||'';
  const brand=cv('colors','brand')||'#884A4A';
  const lightGray=cv('colors','light_gray')||'#6B6B6B';
  const graphite=cv('colors','graphite')||'#2F2F2F';

  // Normalize type for legacy variants
  const t=type.replace(/_legacy$/,'');

  // Virtual canvas = real page desktop width (max-w-[1200px] + padding ≈ 1200px)
  const CANVAS=1200;
  // Scale fills the container exactly once measured; show nothing until we know the width
  const SCALE=containerW>0?containerW/CANVAS:0;
  const PH=Math.round;

  // Outer shell: measured by ResizeObserver, height set dynamically per section
  // outer() renders the measuring shell — ref is on this element
  const outer=(h:number,children:React.ReactNode)=>(
    <div ref={containerRef} className="pointer-events-none select-none mb-3 overflow-hidden rounded-[4px] border border-dashed border-neutral-200 bg-neutral-50/40" style={{height:SCALE>0?PH(h*SCALE):0}}>
      {SCALE>0&&children}
    </div>
  );
  const W=CANVAS;

  if(t==='hero') {
    const img=ci(instance,'image')||cv('images','hero');
    const title=ci(instance,'title')||cv('hero','title')||'Deine Überschrift hier';
    const sub=ci(instance,'subtitle')||cv('hero','subtitle')||'Unterzeile mit mehr Details';
    const cta=ci(instance,'cta_label')||cv('hero','cta_label')||'Jetzt anfragen';
    const H=PH(W*6/16); // 16:6 aspect
    return outer(H,
      <div style={{width:W,height:H,transform:`scale(${SCALE})`,transformOrigin:'top left',position:'relative',background:img?'#111':`linear-gradient(160deg,${brand}cc,${brand}66)`}}>
        {img&&<img src={img} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',opacity:0.55}} alt=""/>}
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,0.7) 0%,rgba(0,0,0,0.15) 60%,transparent 100%)'}}/>
        <div style={{position:'absolute',bottom:0,left:0,right:0,padding:'32px 80px',textAlign:'center',color:'white'}}>
          <div style={{fontSize:38,fontWeight:900,lineHeight:1.15,textShadow:'0 2px 8px rgba(0,0,0,0.4)'}}>{title}</div>
          <div style={{fontSize:15,marginTop:12,opacity:0.85,maxWidth:600,margin:'12px auto 0'}}>{sub}</div>
          <div style={{marginTop:20,display:'flex',justifyContent:'center'}}>
            <span style={{backgroundColor:brand,color:'white',padding:'12px 28px',borderRadius:4,fontWeight:700,fontSize:15}}>{cta}</span>
          </div>
          <div style={{marginTop:16,color:'rgba(255,255,255,0.9)',fontSize:13}}>★★★★★ &nbsp; 100+ Schüler vor Ort &amp; online</div>
        </div>
      </div>
    );
  }
  if(t==='image_text'||t==='image_text_1'||t==='image_text_2') {
    const isRight=t==='image_text_2';
    const img=ci(instance,'image')||(isRight?cv('images','section2'):cv('images','section1'));
    const title=ci(instance,'title')||(isRight?cv('image_text_2','title'):cv('image_text_1','title'))||'Deine Stimme kann mehr';
    const text=ci(instance,'text')||(isRight?cv('image_text_2','text'):cv('image_text_1','text'))||'Beschreibungstext der Sektion.';
    const cta=ci(instance,'cta_label')||(isRight?cv('image_text_2','cta_label'):cv('image_text_1','cta_label'))||'Jetzt anfragen';
    const bullets=t!=='image_text_2'?[
      ci(instance,'bullet_1')||cv('image_text_1','bullet_1')||'Mehr Stimmumfang',
      ci(instance,'bullet_2')||cv('image_text_1','bullet_2')||'Klarerer Klang',
      ci(instance,'bullet_3')||cv('image_text_1','bullet_3')||'Persönliche Begleitung',
    ]:[];
    const H=320;
    return outer(H,
      <div style={{width:W,height:H,transform:`scale(${SCALE})`,transformOrigin:'top left',display:'flex',alignItems:'center',gap:48,padding:'32px 80px',backgroundColor:'white'}}>
        {!isRight&&<div style={{flex:'0 0 42%',aspectRatio:'1',borderRadius:4,overflow:'hidden',backgroundColor:'#e5e7eb'}}>
          {img?<img src={img} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/>:<div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',color:'#aaa',fontSize:12}}>Kein Bild</div>}
        </div>}
        <div style={{flex:1}}>
          <div style={{fontSize:26,fontWeight:900,color:'#111',lineHeight:1.2}}>{title}</div>
          <div style={{fontSize:13,marginTop:10,color:lightGray,lineHeight:1.7,WebkitLineClamp:3,overflow:'hidden',display:'-webkit-box',WebkitBoxOrient:'vertical'}}>{text}</div>
          {bullets.length>0&&<div style={{marginTop:12,display:'flex',flexDirection:'column',gap:6}}>
            {bullets.map((b,i)=><div key={i} style={{display:'flex',alignItems:'center',gap:8}}>
              <div style={{width:18,height:18,borderRadius:'50%',backgroundColor:brand,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <span style={{color:'white',fontSize:10,fontWeight:900}}>✓</span>
              </div>
              <span style={{fontSize:12,color:graphite}}>{b}</span>
            </div>)}
          </div>}
          <div style={{marginTop:16}}>
            <span style={{backgroundColor:brand,color:'white',padding:'10px 22px',borderRadius:4,fontWeight:700,fontSize:13}}>{cta}</span>
          </div>
        </div>
        {isRight&&<div style={{flex:'0 0 42%',aspectRatio:'1',borderRadius:4,overflow:'hidden',backgroundColor:'#e5e7eb'}}>
          {img?<img src={img} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/>:<div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',color:'#aaa',fontSize:12}}>Kein Bild</div>}
        </div>}
      </div>
    );
  }
  if(t==='quote') {
    const q=ci(instance,'quote')||cv('quote_section','quote')||'„Singen soll nicht schwerer werden – sondern freier."';
    const bg=ci(instance,'bg')||cv('images','quote_bg');
    const H=180;
    return outer(H,
      <div style={{width:W,height:H,transform:`scale(${SCALE})`,transformOrigin:'top left',position:'relative',backgroundColor:bg?'#333':brand,display:'flex',alignItems:'center',justifyContent:'center',padding:'40px 120px'}}>
        {bg&&<img src={bg} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',opacity:0.3}} alt=""/>}
        <div style={{position:'relative',textAlign:'center',color:'white'}}>
          <div style={{fontSize:12,fontWeight:700,letterSpacing:'0.15em',textTransform:'uppercase',marginBottom:16,opacity:0.7}}>{cv('quote_section','label')||'Meine Haltung im Unterricht'}</div>
          <div style={{fontSize:20,fontStyle:'italic',fontWeight:600,lineHeight:1.5}}>{q}</div>
        </div>
      </div>
    );
  }
  if(t==='flowing_text') {
    const text=ci(instance,'text')||cv('flowing_text','text')||'Ob du sicherer intonieren, freier in die Höhe kommen oder mit mehr Freude singen möchtest...';
    const H=140;
    return outer(H,
      <div style={{width:W,height:H,transform:`scale(${SCALE})`,transformOrigin:'top left',backgroundColor:'white',display:'flex',alignItems:'center',justifyContent:'center',padding:'32px 120px'}}>
        <div style={{fontSize:17,lineHeight:1.7,textAlign:'center',color:lightGray,fontStyle:'normal'}}>{text}</div>
      </div>
    );
  }
  if(t==='final_cta') {
    const title=ci(instance,'title')||cv('final_cta','title')||'Lass uns schauen, was in deiner Stimme steckt';
    const text=ci(instance,'text')||cv('final_cta','text')||'Ein persönliches Kennenlerngespräch ist der beste erste Schritt.';
    const cta=ci(instance,'cta_label')||cv('final_cta','cta_label')||'Jetzt anfragen';
    const img=ci(instance,'image')||cv('images','final_cta');
    const H=200;
    return outer(H,
      <div style={{width:W,height:H,transform:`scale(${SCALE})`,transformOrigin:'top left',display:'flex',alignItems:'center',gap:48,padding:'28px 80px',backgroundColor:'white'}}>
        <div style={{flex:'0 0 30%',aspectRatio:'16/9',borderRadius:4,overflow:'hidden',backgroundColor:'#e5e7eb'}}>
          {img?<img src={img} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/>:<div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',color:'#aaa',fontSize:12}}>Kein Bild</div>}
        </div>
        <div style={{flex:1}}>
          <div style={{fontSize:22,fontWeight:900,color:'#111',lineHeight:1.2}}>{title}</div>
          <div style={{fontSize:12,marginTop:8,color:lightGray,lineHeight:1.6}}>{text}</div>
          <div style={{marginTop:14}}>
            <span style={{backgroundColor:brand,color:'white',padding:'10px 22px',borderRadius:4,fontWeight:700,fontSize:13}}>{cta}</span>
          </div>
        </div>
      </div>
    );
  }
  if(t==='logos') {
    const label=ci(instance,'label')||cv('logos_section','label')||'Bekannt aus Unterricht, Bühne und Ausbildung';
    const logo1=cv('images','logo1');const logo2=cv('images','logo2');
    const H=140;
    return outer(H,
      <div style={{width:W,height:H,transform:`scale(${SCALE})`,transformOrigin:'top left',backgroundColor:'white',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:20,padding:'20px 80px'}}>
        <div style={{fontSize:11,fontWeight:700,letterSpacing:'0.18em',textTransform:'uppercase',color:brand}}>{label}</div>
        <div style={{display:'flex',gap:24,alignItems:'center',justifyContent:'center'}}>
          {[logo1,logo2].map((l,i)=><div key={i} style={{width:180,height:80,border:'1px solid #e5e7eb',borderRadius:4,backgroundColor:'white',display:'flex',alignItems:'center',justifyContent:'center',padding:12}}>
            {l?<img src={l} style={{maxHeight:52,maxWidth:150,objectFit:'contain'}} alt=""/>:<div style={{width:120,height:20,backgroundColor:'#e5e7eb',borderRadius:4}}/>}
          </div>)}
        </div>
      </div>
    );
  }
  if(t==='feature_cards_3') {
    const cards=[1,2,3].map(i=>({
      title:ci(instance+i,'title')||cv(`feature_card_${i}`,'title')||`Feature ${i}`,
      text:ci(instance+i,'text')||cv(`feature_card_${i}`,'text')||'Beschreibungstext der Karte.',
    }));
    const H=210;
    return outer(H,
      <div style={{width:W,height:H,transform:`scale(${SCALE})`,transformOrigin:'top left',backgroundColor:'white',display:'flex',gap:20,padding:'28px 80px',alignItems:'stretch'}}>
        {cards.map((c,i)=><div key={i} style={{flex:1,backgroundColor:brand,borderRadius:4,padding:'22px 18px',textAlign:'center',color:'white',display:'flex',flexDirection:'column',alignItems:'center',gap:8}}>
          <div style={{width:44,height:44,borderRadius:4,backgroundColor:'rgba(255,255,255,0.15)',border:'1px solid rgba(255,255,255,0.2)',marginBottom:4}}/>
          <div style={{fontSize:15,fontWeight:800,lineHeight:1.2}}>{c.title}</div>
          <div style={{fontSize:11,opacity:0.85,lineHeight:1.6}}>{c.text}</div>
        </div>)}
      </div>
    );
  }
  if(t==='feature_cards_4') {
    const heading=ci(instance+'h','title')||cv('features_2_heading','title')||'Was dich im Gesangsunterricht erwartet';
    const cards=[1,2,3,4].map(i=>({
      title:ci(instance+i,'title')||cv(`feature2_card_${i}`,'title')||`Punkt ${i}`,
      text:ci(instance+i,'text')||cv(`feature2_card_${i}`,'text')||'Kurze Beschreibung.',
    }));
    const H=240;
    return outer(H,
      <div style={{width:W,height:H,transform:`scale(${SCALE})`,transformOrigin:'top left',backgroundColor:'white',padding:'28px 80px'}}>
        <div style={{fontSize:20,fontWeight:900,textAlign:'center',color:'#111',marginBottom:20}}>{heading}</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14}}>
          {cards.map((c,i)=><div key={i} style={{backgroundColor:brand,borderRadius:4,padding:'16px 12px',color:'white',display:'flex',flexDirection:'column',alignItems:'center',gap:6,textAlign:'center'}}>
            <div style={{width:36,height:36,borderRadius:4,backgroundColor:'rgba(255,255,255,0.15)',border:'1px solid rgba(255,255,255,0.2)'}}/>
            <div style={{fontSize:12,fontWeight:700,lineHeight:1.3}}>{c.title}</div>
            <div style={{fontSize:10,opacity:0.8,lineHeight:1.5}}>{c.text}</div>
          </div>)}
        </div>
      </div>
    );
  }
  if(t==='reviews') {
    const title=ci(instance,'title')||cv('reviews','title')||'Stimmen von Schülern';
    const reviews=[1,2,3].map(i=>({
      text:ci(instance+i,'text')||cv(`review_${i}`,'text')||'Sehr empfehlenswert! Martin ist ein toller Lehrer.',
      author:ci(instance+i,'author')||cv(`review_${i}`,'author')||`Schüler ${i}`,
    }));
    const H=230;
    return outer(H,
      <div style={{width:W,height:H,transform:`scale(${SCALE})`,transformOrigin:'top left',backgroundColor:'white',padding:'28px 80px'}}>
        <div style={{fontSize:22,fontWeight:900,textAlign:'center',color:'#111',marginBottom:20}}>{title}</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
          {reviews.map((r,i)=><div key={i} style={{backgroundColor:'#f5f5f5',borderRadius:4,padding:'16px 14px'}}>
            <div style={{color:'#D4AF37',fontSize:13,letterSpacing:1,marginBottom:6}}>★★★★★</div>
            <div style={{fontSize:11,lineHeight:1.65,color:graphite,display:'-webkit-box',WebkitLineClamp:3,overflow:'hidden',WebkitBoxOrient:'vertical'}}>{r.text}</div>
            <div style={{fontSize:11,fontWeight:700,color:brand,marginTop:8}}>– {r.author}</div>
          </div>)}
        </div>
      </div>
    );
  }
  if(t==='about') {
    const img=ci(instance,'image')||cv('images','about');
    const label=ci(instance,'label')||cv('about','label')||'Über Martin';
    const title=ci(instance,'title')||cv('about','title')||'Von der eigenen Suche zur Arbeit mit Sängern';
    const text=ci(instance,'text_1')||cv('about','text_1')||'Mein eigener Wendepunkt kam, als mir jemand in kurzer Zeit etwas gezeigt hat, das ich nach Monaten bei anderen Lehrern nicht geschafft hatte.';
    const H=260;
    return outer(H,
      <div style={{width:W,height:H,transform:`scale(${SCALE})`,transformOrigin:'top left',backgroundColor:'white',display:'flex',alignItems:'center',gap:48,padding:'32px 80px'}}>
        <div style={{flex:'0 0 42%',aspectRatio:'1',borderRadius:4,overflow:'hidden',backgroundColor:'#e5e7eb'}}>
          {img?<img src={img} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/>:<div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',color:'#aaa',fontSize:12}}>Kein Bild</div>}
        </div>
        <div style={{flex:1}}>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:'0.18em',textTransform:'uppercase',color:brand,marginBottom:10}}>{label}</div>
          <div style={{fontSize:22,fontWeight:900,color:'#111',lineHeight:1.2,marginBottom:12}}>{title}</div>
          <div style={{fontSize:12,color:lightGray,lineHeight:1.7}}>{text}</div>
        </div>
      </div>
    );
  }
  if(t==='video_carousel') {
    const title=ci(instance,'title')||cv('video_section','title')||'Hör und sieh selbst';
    const thumbs=[cv('videos','carousel_1_thumb'),cv('videos','carousel_2_thumb'),cv('videos','carousel_3_thumb')];
    const H=190;
    return outer(H,
      <div style={{width:W,height:H,transform:`scale(${SCALE})`,transformOrigin:'top left',backgroundColor:'white',padding:'24px 80px'}}>
        <div style={{fontSize:20,fontWeight:900,color:'#111',marginBottom:16}}>{title}</div>
        <div style={{display:'flex',gap:16}}>
          {thumbs.map((th,i)=><div key={i} style={{flex:1,aspectRatio:'16/9',borderRadius:4,backgroundColor:'#1a1a1a',overflow:'hidden',position:'relative',display:'flex',alignItems:'center',justifyContent:'center'}}>
            {th&&<img src={th} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',opacity:0.7}} alt=""/>}
            <span style={{position:'relative',color:'white',fontSize:24}}>▶</span>
          </div>)}
        </div>
      </div>
    );
  }
  if(t==='testimonials') {
    const q1=cv('testimonial_1','quote')||'„Martin Krendl ist ein absoluter Meister seines Fachs"';
    const q2=cv('testimonial_2','quote')||'„Was der präsentiert ist wow"';
    const th1=cv('videos','testimonial_1_thumb');const th2=cv('videos','testimonial_2_thumb');
    const H=200;
    return outer(H,
      <div style={{width:W,height:H,transform:`scale(${SCALE})`,transformOrigin:'top left',backgroundColor:'white',padding:'24px 80px',display:'flex',gap:24}}>
        {[[th1,q1,cv('testimonial_1','author')],[th2,q2,cv('testimonial_2','author')]].map(([th,q,auth],i)=>(
          <div key={i} style={{flex:1,borderRadius:4,overflow:'hidden',backgroundColor:'#111',position:'relative',display:'flex',alignItems:'flex-end'}}>
            {th&&<img src={th as string} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',opacity:0.5}} alt=""/>}
            <div style={{position:'relative',padding:'12px 14px',color:'white',background:'linear-gradient(to top,rgba(0,0,0,0.8),transparent)'}}>
              <div style={{fontSize:11,fontStyle:'italic',lineHeight:1.4,marginBottom:4,WebkitLineClamp:2,overflow:'hidden',display:'-webkit-box',WebkitBoxOrient:'vertical'}}>{q}</div>
              <div style={{fontSize:10,opacity:0.7}}>{auth}</div>
            </div>
            <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-60%)',width:36,height:36,borderRadius:'50%',backgroundColor:'rgba(255,255,255,0.9)',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <span style={{color:'#111',fontSize:14}}>▶</span>
            </div>
          </div>
        ))}
      </div>
    );
  }
  if(t==='quiz') {
    const quizBg=ci(instance,'bg_color')||cv('colors','quiz_bg')||'#F7F7F7';
    const q1=cv('quiz_q1','question')||'Bereit für deine unverbindliche Probestunde?';
    const q1sub=cv('quiz_q1','subtitle')||'Tippe einfach auf eine Antwort, um deine Anfrage zu starten.';
    const opt1=cv('quiz_q1','option_1')||'Ja, ich bin gespannt';
    const opt2=cv('quiz_q1','option_2')||'Noch unsicher';
    const img1=cv('quiz_q1','img_1')||'/option11.jpg';
    const img2=cv('quiz_q1','img_2')||'/option22.jpg';
    const progress=25;
    const H=380;
    return outer(H,
      <div style={{width:W,height:H,transform:`scale(${SCALE})`,transformOrigin:'top left',backgroundColor:quizBg,padding:'32px 160px 40px',display:'flex',flexDirection:'column',alignItems:'center',gap:0}}>
        {/* Progress bar */}
        <div style={{width:'100%',maxWidth:520,height:8,backgroundColor:'#e5e7eb',borderRadius:99,overflow:'hidden',marginBottom:28}}>
          <div style={{width:`${progress}%`,height:'100%',backgroundColor:brand,borderRadius:99}}/>
        </div>
        {/* Question */}
        <div style={{fontSize:22,fontWeight:800,color:'#2F2F2F',textAlign:'center',lineHeight:1.3,maxWidth:540,marginBottom:10}}>{q1}</div>
        <div style={{fontSize:12,color:'#6B6B6B',textAlign:'center',marginBottom:22}}>{q1sub}</div>
        {/* Image cards */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,width:'100%',maxWidth:520}}>
          {[{opt:opt1,img:img1},{opt:opt2,img:img2}].map(({opt,img},i)=>(
            <div key={i} style={{borderRadius:4,overflow:'hidden',border:'1px solid #e5e7eb',backgroundColor:'white'}}>
              <div style={{width:'100%',aspectRatio:'1',backgroundColor:'#d1d5db',backgroundImage:`url(${img})`,backgroundSize:'cover',backgroundPosition:'center',position:'relative'}}>
                <div style={{position:'absolute',bottom:0,left:0,right:0,padding:'8px 6px',backgroundColor:`${brand}E6`,textAlign:'center'}}>
                  <span style={{color:'white',fontWeight:700,fontSize:11,lineHeight:1.2}}>{opt}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if(t==='component_topbar') {
    const text=cv('header','topbar_text')||'Gesangsunterricht in Steyr oder online 🎶';
    const bg=cv('header','topbar_bg')||'#e0e0e0';
    const color=cv('header','topbar_color')||'#333333';
    const H=36;
    return outer(H,
      <div style={{width:W,height:H,transform:`scale(${SCALE})`,transformOrigin:'top left',backgroundColor:bg,display:'flex',alignItems:'center',justifyContent:'center',gap:12,padding:'0 40px'}}>
        <span style={{fontSize:13,color,fontWeight:500}}>{text}</span>
        <span style={{fontSize:13,color,opacity:0.5}}>✕</span>
      </div>
    );
  }
  if(t==='component_header') {
    const logo=cv('header','logo_text')||'MARTIN KRENDL';
    const cta=cv('header','cta_label')||'Kostenloses Kennenlernen';
    const bg=cv('header','header_bg')||cv('colors','header_bg')||brand;
    const H=60;
    return outer(H,
      <div style={{width:W,height:H,transform:`scale(${SCALE})`,transformOrigin:'top left',backgroundColor:bg,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 80px'}}>
        <span style={{color:'white',fontWeight:900,fontSize:15,letterSpacing:2}}>{logo}</span>
        <span style={{backgroundColor:'white',color:bg,padding:'8px 18px',borderRadius:4,fontWeight:700,fontSize:12}}>{cta}</span>
      </div>
    );
  }
  if(t==='component_footer') {
    const logo=cv('footer','logo_text')||'MARTIN KRENDL';
    const tagline=cv('footer','tagline')||'Gesangsunterricht in Steyr und online.';
    const bg=cv('footer','bg_color')||'#F1F5F9';
    const textColor=cv('footer','text_color')||'#111827';
    const linkColor=cv('footer','link_color')||brand;
    const H=120;
    return outer(H,
      <div style={{width:W,height:H,transform:`scale(${SCALE})`,transformOrigin:'top left',backgroundColor:bg,padding:'28px 80px',display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
        <div>
          <div style={{fontWeight:900,fontSize:14,letterSpacing:2,color:textColor}}>{logo}</div>
          <div style={{fontSize:11,color:textColor,opacity:0.6,marginTop:4}}>{tagline}</div>
        </div>
        <div style={{display:'flex',gap:16}}>
          <span style={{fontSize:11,color:linkColor,textDecoration:'underline'}}>Impressum</span>
          <span style={{fontSize:11,color:linkColor,textDecoration:'underline'}}>Datenschutz</span>
        </div>
      </div>
    );
  }
  if(t==='component_cookie') {
    const msg=cv('cookie','message')||'Wir verwenden Cookies zu Statistik- und Marketingzwecken.';
    const acceptLabel=cv('cookie','accept_label')||'Akzeptieren';
    const bg=cv('cookie','bg_color')||'#ffffff';
    const H=80;
    return outer(H,
      <div style={{width:W,height:H,transform:`scale(${SCALE})`,transformOrigin:'top left',backgroundColor:bg,border:'1px solid #e5e7eb',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 80px',gap:40}}>
        <span style={{fontSize:12,color:'#374151',flex:1}}>{msg}</span>
        <span style={{backgroundColor:'#1f2937',color:'white',padding:'8px 18px',borderRadius:4,fontSize:12,fontWeight:600,whiteSpace:'nowrap'}}>{acceptLabel}</span>
      </div>
    );
  }
  if(t==='component_quiz') {
    // Realistic quiz step-0 preview using actual CMS content
    const quizBg=cv('colors','quiz_bg')||'#F7F7F7';
    const q1=cv('quiz_q1','question')||'Bereit für deine unverbindliche Probestunde?';
    const q1sub=cv('quiz_q1','subtitle')||'Tippe einfach auf eine Antwort, um deine Anfrage zu starten.';
    const opt1=cv('quiz_q1','option_1')||'Ja, ich bin gespannt';
    const opt2=cv('quiz_q1','option_2')||'Noch unsicher';
    const img1=cv('quiz_q1','img_1')||'/option11.jpg';
    const img2=cv('quiz_q1','img_2')||'/option22.jpg';
    const progress=25;
    const H=380;
    return outer(H,
      <div style={{width:W,height:H,transform:`scale(${SCALE})`,transformOrigin:'top left',backgroundColor:quizBg,padding:'32px 160px 40px',display:'flex',flexDirection:'column',alignItems:'center',gap:0}}>
        <div style={{width:'100%',maxWidth:520,height:8,backgroundColor:'#e5e7eb',borderRadius:99,overflow:'hidden',marginBottom:28}}>
          <div style={{width:`${progress}%`,height:'100%',backgroundColor:brand,borderRadius:99}}/>
        </div>
        <div style={{fontSize:22,fontWeight:800,color:'#2F2F2F',textAlign:'center',lineHeight:1.3,maxWidth:540,marginBottom:10}}>{q1}</div>
        <div style={{fontSize:12,color:'#6B6B6B',textAlign:'center',marginBottom:22}}>{q1sub}</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,width:'100%',maxWidth:520}}>
          {[{opt:opt1,img:img1},{opt:opt2,img:img2}].map(({opt,img},i)=>(
            <div key={i} style={{borderRadius:4,overflow:'hidden',border:'1px solid #e5e7eb',backgroundColor:'white'}}>
              <div style={{width:'100%',aspectRatio:'1',backgroundColor:'#d1d5db',backgroundImage:`url(${img})`,backgroundSize:'cover',backgroundPosition:'center',position:'relative'}}>
                <div style={{position:'absolute',bottom:0,left:0,right:0,padding:'8px 6px',backgroundColor:`${brand}E6`,textAlign:'center'}}>
                  <span style={{color:'white',fontWeight:700,fontSize:11,lineHeight:1.2}}>{opt}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  // ── Generic section types ──────────────────────────────────────────────────
  if(t==='cta_banner') {
    const bg=ci(instance,'bg_color')||brand;
    const title=ci(instance,'title')||'CTA Überschrift';
    const cta=ci(instance,'cta_label')||'Jetzt starten';
    const H=120;
    return outer(H,
      <div style={{width:W,height:H,transform:`scale(${SCALE})`,transformOrigin:'top left',backgroundColor:bg,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:14}}>
        <div style={{fontSize:22,fontWeight:900,color:'white',textAlign:'center'}}>{title}</div>
        <span style={{backgroundColor:'rgba(255,255,255,0.9)',color:bg,padding:'10px 24px',borderRadius:4,fontWeight:700,fontSize:13}}>{cta}</span>
      </div>
    );
  }
  if(t==='stats_row') {
    const H=110;
    return outer(H,
      <div style={{width:W,height:H,transform:`scale(${SCALE})`,transformOrigin:'top left',backgroundColor:'white',display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,padding:'20px 80px',alignItems:'center'}}>
        {[1,2,3,4].map(i=><div key={i} style={{textAlign:'center',borderRadius:4,backgroundColor:brand+'11',padding:'12px 8px'}}>
          <div style={{fontSize:24,fontWeight:900,color:brand}}>{ci(instance,`stat_${i}_number`)||'100+'}</div>
          <div style={{fontSize:11,color:lightGray,marginTop:2}}>{ci(instance,`stat_${i}_label`)||`Statistik ${i}`}</div>
        </div>)}
      </div>
    );
  }
  if(t==='faq') {
    const H=190;
    return outer(H,
      <div style={{width:W,height:H,transform:`scale(${SCALE})`,transformOrigin:'top left',backgroundColor:'white',padding:'24px 80px'}}>
        <div style={{fontSize:20,fontWeight:900,color:'#111',marginBottom:14}}>{ci(instance,'title')||'Häufige Fragen'}</div>
        {[1,2,3].map(i=><div key={i} style={{borderBottom:'1px solid #e5e7eb',padding:'10px 0',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <span style={{fontSize:13,color:'#374151'}}>{ci(instance+i,'question')||`Frage ${i}`}</span>
          <span style={{color:'#aaa',fontSize:18}}>+</span>
        </div>)}
      </div>
    );
  }
  if(t==='steps') {
    const H=180;
    return outer(H,
      <div style={{width:W,height:H,transform:`scale(${SCALE})`,transformOrigin:'top left',backgroundColor:'white',padding:'24px 80px'}}>
        <div style={{fontSize:20,fontWeight:900,color:'#111',marginBottom:14}}>{ci(instance,'title')||'So funktioniert es'}</div>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {[1,2,3].map(i=><div key={i} style={{display:'flex',alignItems:'center',gap:12}}>
            <div style={{width:28,height:28,borderRadius:'50%',backgroundColor:brand,color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:900,flexShrink:0}}>{i}</div>
            <div style={{fontSize:13,color:'#374151'}}>{ci(instance+i,'title')||`Schritt ${i}`}</div>
          </div>)}
        </div>
      </div>
    );
  }
  if(t==='checklist') {
    const H=200;
    return outer(H,
      <div style={{width:W,height:H,transform:`scale(${SCALE})`,transformOrigin:'top left',backgroundColor:'white',padding:'24px 80px'}}>
        <div style={{fontSize:20,fontWeight:900,color:'#111',marginBottom:14}}>{ci(instance,'title')||'Checkliste'}</div>
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {[1,2,3,4].map(i=><div key={i} style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:20,height:20,borderRadius:3,backgroundColor:brand,color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:900,flexShrink:0}}>✓</div>
            <div style={{fontSize:13,color:'#374151'}}>{ci(instance+i,'item')||`Punkt ${i}`}</div>
          </div>)}
        </div>
      </div>
    );
  }
  if(t==='text_centered') {
    const H=160;
    return outer(H,
      <div style={{width:W,height:H,transform:`scale(${SCALE})`,transformOrigin:'top left',backgroundColor:'white',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:10,padding:'24px 160px',textAlign:'center'}}>
        {ci(instance,'label')&&<div style={{fontSize:10,fontWeight:700,letterSpacing:'0.18em',textTransform:'uppercase',color:brand}}>{ci(instance,'label')}</div>}
        <div style={{fontSize:22,fontWeight:900,color:'#111',lineHeight:1.2}}>{ci(instance,'title')||'Überschrift'}</div>
        <div style={{fontSize:12,color:lightGray,lineHeight:1.6}}>{ci(instance,'text')||'Beschreibungstext...'}</div>
        <span style={{backgroundColor:brand,color:'white',padding:'10px 22px',borderRadius:4,fontWeight:700,fontSize:12,marginTop:4}}>{ci(instance,'cta_label')||'Mehr erfahren'}</span>
      </div>
    );
  }
  if(t==='pricing') {
    const H=200;
    return outer(H,
      <div style={{width:W,height:H,transform:`scale(${SCALE})`,transformOrigin:'top left',backgroundColor:'white',padding:'24px 80px'}}>
        <div style={{fontSize:18,fontWeight:900,textAlign:'center',color:'#111',marginBottom:16}}>{ci(instance,'title')||'Preisübersicht'}</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14}}>
          {[1,2,3].map(i=><div key={i} style={{border:i===2?`2px solid ${brand}`:'1px solid #e5e7eb',borderRadius:4,padding:'14px 10px',textAlign:'center',backgroundColor:i===2?brand+'08':'white'}}>
            <div style={{fontSize:12,fontWeight:700,color:'#111'}}>{ci(instance+i,'name')||`Paket ${i}`}</div>
            <div style={{fontSize:22,fontWeight:900,color:brand,margin:'6px 0'}}>{ci(instance+i,'price')||'€99'}</div>
          </div>)}
        </div>
      </div>
    );
  }
  if(t==='image_gallery') {
    const H=160;
    return outer(H,
      <div style={{width:W,height:H,transform:`scale(${SCALE})`,transformOrigin:'top left',backgroundColor:'white',padding:'20px 80px'}}>
        <div style={{fontSize:18,fontWeight:900,color:'#111',marginBottom:12}}>{ci(instance,'title')||'Galerie'}</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
          {[1,2,3].map(i=>{const img=ci(instance+i,'image');return(<div key={i} style={{aspectRatio:'1',borderRadius:4,overflow:'hidden',backgroundColor:'#e5e7eb'}}>
            {img&&<img src={img} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/>}
          </div>);})}
        </div>
      </div>
    );
  }
  if(t==='text_columns') {
    const H=160;
    return outer(H,
      <div style={{width:W,height:H,transform:`scale(${SCALE})`,transformOrigin:'top left',backgroundColor:'white',padding:'24px 80px'}}>
        <div style={{fontSize:18,fontWeight:900,textAlign:'center',color:'#111',marginBottom:14}}>{ci(instance,'title')||'Überschrift'}</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24}}>
          {['col_1','col_2'].map((col,i)=><div key={i}>
            <div style={{fontSize:14,fontWeight:700,color:'#111',marginBottom:8}}>{ci(instance,`${col}_title`)||`Spalte ${i+1}`}</div>
            <div style={{display:'flex',flexDirection:'column',gap:4}}>{[1,2,3].map(j=><div key={j} style={{height:8,backgroundColor:'#e5e7eb',borderRadius:4,width:j===1?'100%':j===2?'80%':'60%'}}/>)}</div>
          </div>)}
        </div>
      </div>
    );
  }
  if(t==='image_fullwidth') {
    const img=ci(instance,'image');const title=ci(instance,'title');
    const H=130;
    return outer(H,
      <div style={{width:W,height:H,transform:`scale(${SCALE})`,transformOrigin:'top left',position:'relative',backgroundColor:'#e5e7eb',overflow:'hidden'}}>
        {img&&<img src={img} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}} alt=""/>}
        {title&&<div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',backgroundColor:'rgba(0,0,0,0.35)'}}>
          <span style={{color:'white',fontSize:20,fontWeight:900,textAlign:'center',padding:'0 80px'}}>{title}</span>
        </div>}
      </div>
    );
  }
  if(t==='danke_header') {
    const logo=cv('danke_header','logo_text')||cv('header','logo_text')||'MARTIN KRENDL';
    const bg=cv('colors','header_bg')||brand;
    const H=60;
    return outer(H,
      <div style={{width:W,height:H,transform:`scale(${SCALE})`,transformOrigin:'top left',backgroundColor:bg,display:'flex',alignItems:'center',padding:'0 80px'}}>
        <span style={{color:'white',fontWeight:900,fontSize:15,letterSpacing:2}}>{logo}</span>
      </div>
    );
  }
  if(t==='danke_hero'||t==='danke') {
    const title=cv('danke_hero','title')||'Deine Nachricht ist erfolgreich angekommen';
    const sub=cv('danke_hero','subtitle')||'Danke für dein Interesse am Gesangsunterricht.';
    const H=180;
    return outer(H,
      <div style={{width:W,height:H,transform:`scale(${SCALE})`,transformOrigin:'top left',backgroundColor:'white',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:12,padding:'28px 120px',textAlign:'center'}}>
        <div style={{width:40,height:40,borderRadius:'50%',backgroundColor:brand,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <span style={{color:'white',fontSize:18}}>✓</span>
        </div>
        <div style={{fontSize:20,fontWeight:900,color:'#111',lineHeight:1.3}}>{title}</div>
        <div style={{fontSize:12,color:lightGray,lineHeight:1.6,maxWidth:500}}>{sub}</div>
      </div>
    );
  }
  // Fallback – generic placeholder
  return(<div ref={containerRef} className="pointer-events-none select-none mb-3 overflow-hidden rounded-[4px] border border-dashed border-neutral-200 bg-neutral-50/40">
    <div className="flex items-center justify-center py-6 text-xs text-neutral-400">Vorschau nicht verfügbar</div>
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

// Build a single Google Fonts URL that loads ALL fonts at once for previews
// Build URL loading all fonts at once (Google Fonts supports up to ~100 families per request)
const ALL_FONTS_URL = 'https://fonts.googleapis.com/css2?' +
  GOOGLE_FONTS.map(f=>`family=${encodeURIComponent(f.name)}:ital,wght@0,400;0,700;0,800`).join('&') +
  '&display=block';

function FontPanel({currentFont,onSave}:{currentFont:string;onSave:(f:string)=>void}) {
  const [sel,setSel]=useState(currentFont);
  const [saving,setSaving]=useState(false);
  const [ready,setReady]=useState(false);
  useEffect(()=>{setSel(currentFont);},[currentFont]);
  useEffect(()=>{
    // Inject stylesheet + wait for document.fonts to be ready
    const inject=()=>{
      if(!document.getElementById('cms-all-fonts')){
        const s=document.createElement('link');s.id='cms-all-fonts';s.rel='stylesheet';
        s.href=ALL_FONTS_URL;document.head.prepend(s);
      }
      // Attempt to load each font explicitly so browser actually downloads them
      Promise.allSettled(
        GOOGLE_FONTS.map(f=>document.fonts.load(`700 14px '${f.name}'`))
      ).then(()=>setReady(true));
    };
    if(document.fonts){inject();}else{setReady(true);}
  },[]);
  const selFont=GOOGLE_FONTS.find(f=>f.name===sel)||GOOGLE_FONTS[0];
  const save=async()=>{setSaving(true);await fetch('/api/admin/font-settings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({font:sel,url:selFont.url})});setSaving(false);onSave(sel);};
  return (
    <div className="rounded-[4px] border border-neutral-200 bg-white p-5 space-y-4 shadow-sm">
      <div className="flex items-center gap-2"><Type className="h-4 w-4 text-neutral-400"/><h3 className="font-bold text-neutral-800 text-sm">Globale Schriftart</h3><span className="ml-auto text-xs text-neutral-400">Gilt für alle öffentlichen Seiten</span></div>
      {!ready&&<div className="flex items-center justify-center gap-2 py-3 text-xs text-neutral-400"><Loader2 className="h-3.5 w-3.5 animate-spin"/>Schriftarten werden geladen…</div>}
      <div className={`grid grid-cols-1 gap-1 max-h-72 overflow-y-auto pr-1 ${ready?'':'hidden'}`}>
        {GOOGLE_FONTS.map(f=>(
          <button key={f.name} type="button" onClick={()=>setSel(f.name)}
            className={`rounded-[4px] border px-4 py-2.5 text-left transition flex items-center gap-3 ${sel===f.name?'border-[#884A4A] bg-[#FDF8F8]':'border-neutral-100 hover:border-neutral-300 hover:bg-neutral-50'}`}>
            <span className={`text-xs w-28 shrink-0 ${sel===f.name?'font-semibold text-[#884A4A]':'text-neutral-400'}`}>{f.name}</span>
            <span style={{fontFamily:`'${f.name}',sans-serif`,fontSize:15,color:'#111827',flex:1,lineHeight:'1.4'}}>{f.preview}</span>
            {sel===f.name&&<CheckCircle className="h-3.5 w-3.5 shrink-0 ml-auto text-[#884A4A]"/>}
          </button>
        ))}
      </div>
      {ready&&(
        <div className="rounded-[4px] bg-neutral-50 border border-neutral-100 px-4 py-3 space-y-1">
          <p className="text-[10px] uppercase tracking-wider text-neutral-400">Vorschau — {sel}</p>
          <p className="text-xl font-bold" style={{fontFamily:`'${sel}',sans-serif`}}>Sing freier, sicherer</p>
          <p className="text-sm text-neutral-500" style={{fontFamily:`'${sel}',sans-serif`}}>und mit mehr Ausdruck durch die Voiceation Methode.</p>
        </div>
      )}
      <button onClick={save} disabled={saving} className="h-10 w-full rounded-[4px] text-sm font-semibold text-white disabled:opacity-40 flex items-center justify-center gap-2" style={{backgroundColor:brand}}>
        {saving?<Loader2 className="h-4 w-4 animate-spin"/>:<Save className="h-4 w-4"/>}{saving?'Wird gespeichert...':'Schriftart übernehmen'}
      </button>
    </div>
  );
}

function ColorPanel({content,onChange,onSave,saving}:{content:CM;onChange:(k:string,v:string)=>void;onSave:()=>void;saving:boolean}) {
  const fields=[
    {key:'colors::brand',     label:'Brand-Farbe',       hint:'Buttons, Akzente, Links'},
    {key:'colors::graphite',  label:'Textfarbe dunkel',  hint:'Haupt-Fließtext'},
    {key:'colors::dark_gray', label:'Textfarbe mittel',  hint:'Sekundäre Überschriften'},
    {key:'colors::light_gray',label:'Textfarbe hell',    hint:'Untertitel, Subtexte'},
  ];
  return (
    <div className="rounded-[4px] border border-neutral-200 bg-white p-5 space-y-4 shadow-sm">
      <div className="flex items-center gap-2">
        <Palette className="h-4 w-4 text-neutral-400"/>
        <h3 className="font-bold text-neutral-800 text-sm">Globale Farben</h3>
        <span className="ml-auto text-xs text-neutral-400">Gilt für alle öffentlichen Seiten</span>
      </div>
      <div className="space-y-3">
        {fields.map(f=>{
          const val=content[f.key]||'';
          return (
            <div key={f.key} className="flex items-center gap-3">
              <input type="color" value={val||'#884A4A'} onChange={e=>onChange(f.key,e.target.value)}
                className="h-9 w-9 shrink-0 cursor-pointer rounded-[4px] border border-neutral-200 p-0.5"/>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-neutral-700">{f.label}</div>
                <div className="text-xs text-neutral-400">{f.hint}</div>
              </div>
              <code className="text-[10px] text-neutral-400 font-mono">{val||'—'}</code>
            </div>
          );
        })}
      </div>
      <button onClick={onSave} disabled={saving} className="h-10 w-full rounded-[4px] text-sm font-semibold text-white disabled:opacity-40 flex items-center justify-center gap-2" style={{backgroundColor:brand}}>
        {saving?<Loader2 className="h-4 w-4 animate-spin"/>:<Save className="h-4 w-4"/>}{saving?'Wird gespeichert...':'Farben speichern & live'}
      </button>
    </div>
  );
}

const COMPONENT_PAGES: CmsPage[] = [
  {id:'component_header',label:'Header',path:'(Komponente)',is_system:true},
  {id:'component_topbar',label:'Ankündigungsleiste',path:'(Komponente)',is_system:true},
  {id:'component_footer',label:'Footer',path:'(Komponente)',is_system:true},
  {id:'component_cookie',label:'Cookie Banner',path:'(Komponente)',is_system:true},
  {id:'component_quiz',label:'Quiz (Standard)',path:'(Komponente)',is_system:true},
];
const COMPONENT_SECTIONS: Record<string,SectInstance> = {
  'component_header':{id:'virtual_header',page_id:'component_header',section_instance:'header',section_type:'component_header',label:'Header',sort_order:0,hidden:false},
  'component_topbar':{id:'virtual_topbar',page_id:'component_topbar',section_instance:'topbar',section_type:'component_topbar',label:'Ankündigungsleiste',sort_order:0,hidden:false},
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
  const [showColorPanel,setShowColorPanel]=useState(false);
  const [currentFont,setCurrentFont]=useState('Open Sans');
  const [headerEnabled,setHeaderEnabled]=useState(true);
  const [footerEnabled,setFooterEnabled]=useState(true);
  const [topbarEnabled,setTopbarEnabled]=useState(true);
  const draggingId=useRef<string|null>(null);
  const pageDropRef=useRef<HTMLDivElement>(null);

  // Warn before leaving with unsaved changes
  useEffect(()=>{
    const handler=(e:BeforeUnloadEvent)=>{
      if(dirty.size>0){e.preventDefault();e.returnValue='';}
    };
    window.addEventListener('beforeunload',handler);
    return()=>window.removeEventListener('beforeunload',handler);
  },[dirty]);

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
        // Filter out test/quiz_* pages - only real pages + components
        const realPagesData = j.data.filter((p:any)=>!p.id.startsWith('quiz_')&&p.id!=='p/test'&&p.id!=='test');
        setPages([...realPagesData,...COMPONENT_PAGES]);
        setSelectedPage(realPagesData[0]||null);
      }
    }).catch(()=>{});
  },[]);

  const isComp=(pid:string)=>pid.startsWith('component_');
  const isQuiz=(pid:string)=>pid.startsWith('quiz_');

  const loadPage=useCallback(async(page:CmsPage)=>{
    setLoading(true);setError('');setDirty(new Set());
    setHeaderEnabled(true);setFooterEnabled(true);setTopbarEnabled(true);
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
          const showT=(cR.data||[]).find((e:any)=>e.section_key==='layout'&&e.field_key==='show_topbar');
          setHeaderEnabled(showH?showH.value!=='false':true);
          setFooterEnabled(showF?showF.value!=='false':true);
          setTopbarEnabled(showT?showT.value!=='false':true);
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
        await fetch('/api/admin/sections',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({page_id:selectedPage.id,updates:sections.map((s,i)=>({id:s.id,sort_order:i,hidden:s.hidden})),settings:{header_enabled:headerEnabled,footer_enabled:footerEnabled,topbar_enabled:topbarEnabled}})});
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
        // Ensure new section is visible
        const newSect={...json.data,hidden:false};
        setSections(p=>[...p,newSect]);
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


  return (
    <>


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
            <button type="button" onClick={()=>{
              const opening=!showColorPanel;
              setShowColorPanel(v=>!v);setShowFontPanel(false);
              if(opening){
                // Load global colors from home page into local content state
                fetch('/api/admin/content?page=home').then(r=>r.json()).then(j=>{
                  if(j.ok){const updates:CM={};for(const e of(j.data||[])){if(e.section_key==='colors')updates[`${e.section_key}::${e.field_key}`]=e.value;}
                  setContent(p=>({...p,...updates}));}
                }).catch(()=>{});
              }
            }} className={`flex h-9 items-center gap-1.5 rounded-[4px] border px-3 text-sm transition ${showColorPanel?'border-[#884A4A] bg-[#FDF8F8] text-[#884A4A]':'border-neutral-200 text-neutral-600 hover:bg-neutral-50'}`}>
              <Palette className="h-4 w-4"/> Farben
            </button>
            {savedAt&&totalDirty===0&&<span className="flex items-center gap-1.5 text-sm text-emerald-600"><CheckCircle className="h-4 w-4"/>{savedAt.toLocaleTimeString('de-AT',{hour:'2-digit',minute:'2-digit'})} gespeichert</span>}
            {totalDirty>0&&<span className="flex items-center gap-1.5 text-sm text-amber-600"><AlertCircle className="h-4 w-4"/>{totalDirty} ungespeichert</span>}
            <button onClick={handleSave} disabled={saving||totalDirty===0} className="flex items-center gap-2 rounded-[4px] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-40" style={{backgroundColor:brand}}>
              {saving?<Loader2 className="h-4 w-4 animate-spin"/>:<Save className="h-4 w-4"/>}{saving?'Speichern...':'Speichern & live'}
            </button>
          </div>
        </div>

        <div className="grid gap-4" style={{gridTemplateColumns:showFontPanel||showColorPanel?'1fr':'',display:showFontPanel||showColorPanel?'grid':'none'}}>
          {showFontPanel&&<FontPanel currentFont={currentFont} onSave={f=>{setCurrentFont(f);setShowFontPanel(false);}}/>}
          {showColorPanel&&<ColorPanel content={content} onChange={handleChange} onSave={async()=>{
            // Save color keys directly to page=home so they affect the live site
            const colorKeys=Object.keys(content).filter(k=>k.startsWith('colors::'));
            if(colorKeys.length){
              const updates=colorKeys.map(k=>{const[sk,fk]=k.split('::');return{section_key:sk,field_key:fk,value:content[k]??''};});
              await fetch('/api/admin/content',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({page:'home',updates})});
            }
            setDirty(new Set());setSavedAt(new Date());
          }} saving={saving}/>}
        </div>

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
            {([['Ankündigungsleiste',topbarEnabled,setTopbarEnabled],['Header',headerEnabled,setHeaderEnabled],['Footer',footerEnabled,setFooterEnabled]] as const).map(([lbl,val,setter])=>(
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
            {sections.filter(section=>{
              // Hide sections that have no editable fields and are non-addable system sections
              const def=SECT_MAP[section.section_type];
              if(def&&!def.addable&&def.fields.length===0)return false;
              return true;
            }).map(section=>(
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

        {/* ── Bottom sticky save bar ── */}
        {totalDirty>0&&(
          <div className="sticky bottom-4 z-30 flex items-center justify-between gap-4 rounded-[4px] border border-amber-200 bg-amber-50 px-5 py-3 shadow-lg">
            <div className="flex items-center gap-2 text-sm text-amber-700">
              <AlertCircle className="h-4 w-4 shrink-0"/>
              <span><strong>{totalDirty}</strong> ungespeicherte Änderung{totalDirty!==1?'en':''}</span>
            </div>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 rounded-[4px] px-5 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-40 shadow-sm" style={{backgroundColor:brand}}>
              {saving?<Loader2 className="h-4 w-4 animate-spin"/>:<Save className="h-4 w-4"/>}
              {saving?'Speichern...':'Jetzt speichern & live'}
            </button>
          </div>
        )}
      </div>
      {showAddSection&&<AddSectionDialog onAdd={addSection} onClose={()=>setShowAddSection(false)}/>}
    </>
  );
}
