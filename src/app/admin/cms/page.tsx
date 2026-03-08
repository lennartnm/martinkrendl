'use client';
// src/app/admin/cms/page.tsx — Enhanced CMS with grouped fields, bold/italic, font selector, header/footer toggle, quiz management

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Save, CheckCircle, AlertCircle, Loader2, Upload, Eye, EyeOff,
  ChevronDown, ChevronRight, Palette, Image as ImageIcon, Video,
  Link as LinkIcon, Type, GripVertical, FileText, Plus, Trash2,
  Globe, X, ArrowRight, Copy, Bold, Italic, Layout, Settings,
  AlignLeft, Hash,
} from 'lucide-react';

const brand = '#884A4A';
type CM = Record<string, string>;
type FT = 'text' | 'textarea' | 'color' | 'image' | 'video' | 'link';
type Field = { section_key: string; field_key: string; label: string; type: FT; hint?: string; group?: string };
type SectInstance = { id: string; page_id: string; section_instance: string; section_type: string; label: string; sort_order: number; hidden: boolean };
type CmsPage = { id: string; label: string; path: string; is_system: boolean };

const GOOGLE_FONTS = [
  'Open Sans','Roboto','Lato','Montserrat','Poppins','Raleway',
  'Nunito','Playfair Display','Merriweather','Source Sans 3',
  'Inter','DM Sans','Outfit','Plus Jakarta Sans','Figtree',
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
      <button type="button" title="Kursiv" onClick={()=>wrap('_','_')} className="flex h-6 w-6 items-center justify-center rounded border border-neutral-200 bg-white text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800 transition"><Italic className="h-3 w-3"/></button>
      <span className="ml-1 text-[10px] text-neutral-400">**fett** _kursiv_</span>
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
  useEffect(()=>{
    fetch('/api/admin/quiz-configs').then(r=>r.json()).then(j=>{if(j.ok)setQuizzes(j.data||[]);}).catch(()=>{});
  },[]);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2"><Settings className="h-3.5 w-3.5 text-neutral-400"/><span className="text-sm font-semibold text-neutral-800">Quiz auswählen</span>{isDirty&&<DirtyBadge/>}</div>
      <div className="pl-5">
        <select value={value||'component_quiz'} onChange={e=>onChange(e.target.value)} className="h-10 w-full rounded-[4px] border border-neutral-200 px-3 text-sm outline-none focus:border-[#884A4A]" style={{borderColor:isDirty?'#F59E0B':'#E5E7EB'}}>
          {quizzes.map(q=><option key={q.id} value={q.id}>{q.label}</option>)}
        </select>
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
];

const SECT_MAP = Object.fromEntries(SECT_TYPES.map(s=>[s.type,s]));

function SectionRow({section,content,dirty,onChange,onUpload,onToggleHide,isDragging,onDragStart,onDragOver,onDrop,onDragEnd,onDuplicate,onDelete,duplicating}:{
  section:SectInstance;content:CM;dirty:Set<string>;
  onChange:(key:string,val:string)=>void;
  onUpload:(file:File)=>Promise<string>;
  onToggleHide:()=>void;isDragging:boolean;
  onDragStart:()=>void;onDragOver:(e:React.DragEvent)=>void;onDrop:()=>void;onDragEnd:()=>void;
  onDuplicate:()=>void;onDelete:()=>void;duplicating?:boolean;
}) {
  const [open,setOpen]=useState(false);
  const [openGroups,setOpenGroups]=useState<Record<string,boolean>>({});
  const isLeg=section.section_instance===section.section_type||(section.section_instance.length<30&&!section.section_instance.match(/_[a-z0-9]{6,}$/));
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
      className={`rounded-[4px] border transition ${isDragging?'opacity-40 scale-[0.98]':''} ${duplicating?'opacity-60':''} ${section.hidden?'border-dashed border-neutral-200 bg-neutral-50/50':'border-neutral-200 bg-white'}`}>
      <div className="flex items-center gap-2 px-4 py-3">
        <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-neutral-300 hover:text-neutral-400"/>
        <button type="button" onClick={()=>setOpen(v=>!v)} className="flex flex-1 items-center gap-2 text-left min-w-0">
          {open?<ChevronDown className="h-4 w-4 shrink-0 text-neutral-400"/>:<ChevronRight className="h-4 w-4 shrink-0 text-neutral-400"/>}
          <span className={`truncate text-sm font-semibold ${section.hidden?'text-neutral-400 line-through':'text-neutral-800'}`}>{section.label}</span>
          {hasDirty&&<DirtyBadge/>}
          {fields.length===0&&<span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] text-neutral-400">keine Felder</span>}
        </button>
        <div className="flex shrink-0 items-center gap-0.5">
          <button type="button" onClick={onDuplicate} disabled={duplicating} title="Duplizieren" className="flex h-7 w-7 items-center justify-center rounded text-neutral-300 transition hover:bg-neutral-100 hover:text-[#884A4A] disabled:opacity-40">
            {duplicating?<Loader2 className="h-3.5 w-3.5 animate-spin text-[#884A4A]"/>:<Copy className="h-3.5 w-3.5"/>}
          </button>
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

function NewPageDialog({pages,onAdd,onClose}:{pages:CmsPage[];onAdd:(label:string,path:string,sourceId?:string)=>void;onClose:()=>void}) {
  const [label,setLabel]=useState('');const [path,setPath]=useState('/');const [src,setSrc]=useState('');
  // Only real pages (not components/quiz variants) as templates
  const realPages=pages.filter(p=>!p.id.startsWith('component_')&&!p.id.startsWith('quiz_'));
  return (
    <Modal title="Neue Seite anlegen" onClose={onClose}>
      <div className="space-y-3">
        <div><label className="mb-1 block text-xs font-semibold text-neutral-500">NAME DER SEITE</label><input value={label} onChange={e=>setLabel(e.target.value)} placeholder="z.B. Landingpage Herbst" className="h-10 w-full rounded-[4px] border border-neutral-200 px-3 text-sm outline-none focus:border-[#884A4A]"/></div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-neutral-500">URL-PFAD</label>
          <input value={path} onChange={e=>setPath(e.target.value)} placeholder="/landingpage-herbst" className="h-10 w-full rounded-[4px] border border-neutral-200 px-3 font-mono text-sm outline-none focus:border-[#884A4A]"/>
          <p className="mt-1 text-xs text-neutral-400">Die Seite wird unter <code className="bg-neutral-100 px-1 rounded">/p/[slug]</code> erreichbar sein (generische Route).</p>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-neutral-500">SEKTIONEN KOPIEREN VON (optional)</label>
          <select value={src} onChange={e=>setSrc(e.target.value)} className="h-10 w-full rounded-[4px] border border-neutral-200 px-3 text-sm outline-none focus:border-[#884A4A]">
            <option value="">— Leere Seite starten —</option>
            {realPages.map(p=><option key={p.id} value={p.id}>{p.label} ({p.path})</option>)}
          </select>
        </div>
        <div className="rounded-[4px] border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          <strong>✓ Dynamische Route vorhanden:</strong> Neue Seiten werden automatisch unter <code className="bg-emerald-100 px-1 rounded">/p/[slug]</code> erreichbar. Kein Code-Einsatz nötig.
        </div>
      </div>
      <button onClick={()=>{if(label&&path){onAdd(label,path,src||undefined);onClose();}}} disabled={!label||!path} className="mt-4 w-full h-10 rounded-[4px] text-sm font-semibold text-white disabled:opacity-40" style={{backgroundColor:brand}}>
        {src?'Seite duplizieren & anlegen':'Neue Seite anlegen'}
      </button>
    </Modal>
  );
}

function FontPanel({currentFont,onSave}:{currentFont:string;onSave:(f:string)=>void}) {
  const [sel,setSel]=useState(currentFont);const [saving,setSaving]=useState(false);
  useEffect(()=>{setSel(currentFont);},[currentFont]);
  const save=async()=>{setSaving(true);await fetch('/api/admin/font-settings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({font:sel})});setSaving(false);onSave(sel);};
  return (
    <div className="rounded-[4px] border border-neutral-200 bg-white p-5 space-y-3">
      <div className="flex items-center gap-2"><Type className="h-4 w-4 text-neutral-400"/><h3 className="font-bold text-neutral-800 text-sm">Globale Schriftart</h3></div>
      <p className="text-xs text-neutral-400">Gilt für alle Seiten, Admin-Bereich und Login-Seite.</p>
      <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto">
        {GOOGLE_FONTS.map(f=>(
          <button key={f} type="button" onClick={()=>setSel(f)}
            className={`rounded-[4px] border px-3 py-2 text-left text-sm transition ${sel===f?'border-[#884A4A] bg-[#FDF8F8] font-semibold text-[#884A4A]':'border-neutral-200 text-neutral-700 hover:bg-neutral-50'}`}
            style={{fontFamily:f}}>{f}</button>
        ))}
      </div>
      <div className="rounded-[4px] bg-neutral-50 border border-neutral-200 p-3">
        <p className="text-xs text-neutral-400 mb-1">Vorschau</p>
        <p className="text-base" style={{fontFamily:sel}}>Sing freier, sicherer und mit mehr Ausdruck.</p>
      </div>
      <button onClick={save} disabled={saving} className="h-9 w-full rounded-[4px] text-sm font-semibold text-white disabled:opacity-40 flex items-center justify-center gap-2" style={{backgroundColor:brand}}>
        {saving?<Loader2 className="h-4 w-4 animate-spin"/>:<Save className="h-4 w-4"/>}{saving?'Speichern...':'Schriftart übernehmen'}
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
  const [showNewPage,setShowNewPage]=useState(false);
  const [showFontPanel,setShowFontPanel]=useState(false);
  const [currentFont,setCurrentFont]=useState('Open Sans');
  const [headerEnabled,setHeaderEnabled]=useState(true);
  const [footerEnabled,setFooterEnabled]=useState(true);
  const [duplicatingId,setDuplicatingId]=useState<string|null>(null);
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

  const duplicateSection=async(s:SectInstance)=>{
    if(!selectedPage||isComp(selectedPage.id))return;
    setDuplicatingId(s.id);
    try {
      const res=await fetch('/api/admin/sections',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({page_id:selectedPage.id,section_type:s.section_type,label:s.label+' (Kopie)',source_instance:s.section_instance})});
      const json=await res.json();
      if(json.ok){
        const ns={...json.data,hidden:true};
        setSections(p=>{const idx=p.findIndex(x=>x.id===s.id);const n=[...p];n.splice(idx+1,0,ns);return n;});
        const sc:CM={};const def=SECT_MAP[s.section_type];
        if(def){for(const f of def.fields){const sk=resolveKey(f,s.section_instance);const dk=resolveKey(f,json.data.section_instance);if(content[sk]!==undefined)sc[dk]=content[sk];}}
        setContent(p=>({...p,...sc}));
      }
    } finally{setDuplicatingId(null);}
  };

  const deleteSection=async(s:SectInstance)=>{
    if(!confirm(`Sektion "${s.label}" wirklich löschen?`))return;
    await fetch('/api/admin/sections',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:s.id,page_id:selectedPage?.id,section_instance:s.section_instance})});
    setSections(p=>p.filter(x=>x.id!==s.id));
  };

  const addSection=async(type:string,label:string)=>{
    if(!selectedPage)return;
    const res=await fetch('/api/admin/sections',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({page_id:selectedPage.id,section_type:type,label})});
    const json=await res.json();if(json.ok)setSections(p=>[...p,json.data]);
  };

  const createPage=async(label:string,path:string,sourceId?:string)=>{
    const res=await fetch('/api/admin/pages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({label,path,source_page:sourceId})});
    const json=await res.json();if(json.ok){setPages(p=>[...p,json.data]);setSelectedPage(json.data);}
  };

  const deletePage=async(page:CmsPage)=>{
    if(page.is_system)return;
    if(!confirm(`Seite "${page.label}" löschen?`))return;
    await fetch('/api/admin/pages',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:page.id})});
    setPages(p=>{const n=p.filter(x=>x.id!==page.id);setSelectedPage(n[0]||null);return n;});
  };

  const totalDirty=dirty.size;
  const isNormal=selectedPage&&!isComp(selectedPage.id)&&!isQuiz(selectedPage.id);
  const realPages=pages.filter(p=>!p.id.startsWith('component_')&&!p.id.startsWith('quiz_'));
  const compPages=pages.filter(p=>p.id.startsWith('component_'));
  const quizPages=pages.filter(p=>p.id.startsWith('quiz_'));

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=${encodeURIComponent(currentFont)}:wght@400;600;700;800&display=swap'); *{font-family:'${currentFont}',sans-serif!important}`}</style>
      {showAddSection&&<AddSectionDialog onAdd={addSection} onClose={()=>setShowAddSection(false)}/>}
      {showNewPage&&<NewPageDialog pages={pages} onAdd={createPage} onClose={()=>setShowNewPage(false)}/>}

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
            <button type="button" onClick={()=>setPageDropOpen(v=>!v)} className="flex h-10 items-center gap-2 rounded-[4px] border border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-700 shadow-sm transition hover:border-[#884A4A]">
              <Globe className="h-4 w-4 text-neutral-400"/>
              <span>{selectedPage?.label??'Seite wählen'}</span>
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] text-neutral-400 font-normal">{selectedPage?.path}</span>
              <ChevronDown className={`h-4 w-4 text-neutral-400 transition-transform ${pageDropOpen?'rotate-180':''}`}/>
            </button>
            {pageDropOpen&&(
              <div className="absolute left-0 top-full z-50 mt-1 min-w-[280px] overflow-hidden rounded-[4px] border border-neutral-200 bg-white shadow-lg">
                {realPages.length>0&&<>
                  <div className="px-3 pt-2 pb-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Seiten</div>
                  {realPages.map(p=>(
                    <div key={p.id} onClick={()=>{setSelectedPage(p);setPageDropOpen(false);}} className={`group flex cursor-pointer items-center gap-2 px-4 py-2.5 transition hover:bg-[#FDF8F8] ${selectedPage?.id===p.id?'bg-[#FDF8F8]':''}`}>
                      <FileText className="h-3.5 w-3.5 shrink-0 text-neutral-300"/>
                      <span className={`flex-1 text-sm ${selectedPage?.id===p.id?'font-semibold text-[#884A4A]':'font-medium text-neutral-700'}`}>{p.label}</span>
                      <span className="font-mono text-xs text-neutral-400">{p.path}</span>
                      {!p.is_system&&<button type="button" onClick={e=>{e.stopPropagation();deletePage(p);}} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition"><Trash2 className="h-3 w-3"/></button>}
                      {selectedPage?.id===p.id&&<CheckCircle className="h-3.5 w-3.5 shrink-0 text-[#884A4A]"/>}
                    </div>
                  ))}
                </>}
                {quizPages.length>0&&<>
                  <div className="px-3 pt-2 pb-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider border-t border-neutral-100">Quiz-Varianten</div>
                  {quizPages.map(p=>(
                    <div key={p.id} onClick={()=>{setSelectedPage(p);setPageDropOpen(false);}} className={`group flex cursor-pointer items-center gap-2 px-4 py-2.5 transition hover:bg-[#FDF8F8] ${selectedPage?.id===p.id?'bg-[#FDF8F8]':''}`}>
                      <Hash className="h-3.5 w-3.5 shrink-0 text-neutral-300"/>
                      <span className={`flex-1 text-sm ${selectedPage?.id===p.id?'font-semibold text-[#884A4A]':'font-medium text-neutral-700'}`}>{p.label}</span>
                      {!p.is_system&&<button type="button" onClick={e=>{e.stopPropagation();deletePage(p);}} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition"><Trash2 className="h-3 w-3"/></button>}
                      {selectedPage?.id===p.id&&<CheckCircle className="h-3.5 w-3.5 shrink-0 text-[#884A4A]"/>}
                    </div>
                  ))}
                </>}
                {compPages.length>0&&<>
                  <div className="px-3 pt-2 pb-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider border-t border-neutral-100">Komponenten</div>
                  {compPages.map(p=>(
                    <div key={p.id} onClick={()=>{setSelectedPage(p);setPageDropOpen(false);}} className={`group flex cursor-pointer items-center gap-2 px-4 py-2.5 transition hover:bg-[#FDF8F8] ${selectedPage?.id===p.id?'bg-[#FDF8F8]':''}`}>
                      <Layout className="h-3.5 w-3.5 shrink-0 text-neutral-300"/>
                      <span className={`flex-1 text-sm ${selectedPage?.id===p.id?'font-semibold text-[#884A4A]':'font-medium text-neutral-700'}`}>{p.label}</span>
                      {selectedPage?.id===p.id&&<CheckCircle className="h-3.5 w-3.5 shrink-0 text-[#884A4A]"/>}
                    </div>
                  ))}
                </>}
                <div className="border-t border-neutral-100"/>
                <button type="button" onClick={()=>{setPageDropOpen(false);setShowNewPage(true);}} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#884A4A] transition hover:bg-[#FDF8F8]">
                  <Plus className="h-4 w-4"/> Neue Seite anlegen
                </button>
                <button type="button" onClick={async()=>{
                  setPageDropOpen(false);
                  const label=prompt('Name der neuen Quiz-Variante:');
                  if(!label)return;
                  const res=await fetch('/api/admin/quiz-configs',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({label,source_id:selectedPage?.id?.startsWith('quiz_')?selectedPage.id:'component_quiz'})});
                  const json=await res.json();
                  if(json.ok){
                    const np:CmsPage={...json.data,path:'(Quiz-Variante)',is_system:false};
                    setPages(prev=>[...prev,np]);setSelectedPage(np);
                  }
                }} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50">
                  <Plus className="h-4 w-4"/> Quiz duplizieren / neu anlegen
                </button>
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
          <div className="flex items-center gap-4 rounded-[4px] border border-neutral-200 bg-white px-4 py-3">
            <span className="text-sm font-semibold text-neutral-600">Auf dieser Seite anzeigen:</span>
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" checked={headerEnabled} onChange={e=>{setHeaderEnabled(e.target.checked);setDirty(p=>new Set([...p,'__settings__']));}} className="h-4 w-4 rounded accent-[#884A4A]"/>
              <span className="text-sm text-neutral-700">Header</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" checked={footerEnabled} onChange={e=>{setFooterEnabled(e.target.checked);setDirty(p=>new Set([...p,'__settings__']));}} className="h-4 w-4 rounded accent-[#884A4A]"/>
              <span className="text-sm text-neutral-700">Footer</span>
            </label>
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
                onDuplicate={()=>duplicateSection(section)} onDelete={()=>deleteSection(section)}
                duplicating={duplicatingId===section.id}/>
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
