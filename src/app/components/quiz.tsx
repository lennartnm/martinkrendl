'use client';
// src/app/components/quiz.tsx
// Updated: supports quizId prop for multi-quiz, bold/italic rich text, quiz_id tracking

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { MapPin, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const D = {
  brand:'#884A4A',quiz_bg:'#f7f7f7',
  header_title:'',header_sub:'',
  q1_question:'Bereit für deine unverbindliche Probestunde?',
  q1_subtitle:'Tippe einfach auf eine Antwort, um deine Anfrage zu starten.',
  q1_opt1:'Ja, ich bin gespannt',q1_opt2:'Noch unsicher',
  q1_img1:'/option11.jpg',q1_img2:'/option22.jpg',
  q2_question:'Hast du bereits Erfahrung im Singen?',
  q2_opt1:'Ja, im Kirchenchor',q2_opt2:'Ja, in der Band',
  q2_opt3:'Sonstige Erfahrung',q2_opt4:'Noch keine Erfahrung',
  q2_img1:'/kirchenchor.jpg',q2_img2:'/band.jpg',
  q2_img3:'/sonstige-erfahrung.jpg',q2_img4:'/keine-erfahrung.jpg',
  q3_question:'Interessiert du dich für vor-Ort Unterricht oder online?',
  q3_opt1:'Vor-Ort Unterricht',q3_opt2:'Online-Unterricht',
  form_title:'Du bist bereit für deine Probestunde!',
  form_subtitle:'Wow, das klingt super! Ich lade dich herzlich zu einer unverbindlichen Probestunde ein. Dort lernst du die Voiceation Methode kennen und wie sie deine Stimme auf das nächste Level hebt. Ich freue mich auf dich!\n\nDein Martin',
  form_name:'Dein Name',form_email:'Deine E-Mail-Adresse',
  form_phone:'Deine Telefonnummer',
  form_submit:'Unverbindliche Probestunde anfragen',
  form_privacy:'Mit dem Absenden erklärst du dich mit der Verarbeitung deiner Angaben einverstanden.',
};

type CmsQuiz = typeof D;
type Answers = { ready?: string; experience?: string; lessonType?: string; };

// Rich text renderer
function RT({ t }: { t: string }) {
  if (!t) return null;
  const parts = t.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return <>{parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) return <strong key={i}>{p.slice(2,-2)}</strong>;
    if (p.startsWith('*') && p.endsWith('*')) return <em key={i}>{p.slice(1,-1)}</em>;
    return p;
  })}</>;
}

function ProgressBar({step,brand}:{step:number;brand:string}) {
  const progress=((step+1)/4)*100;
  return <div className="mx-auto w-full max-w-xl"><div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200"><div className="h-full rounded-full transition-all duration-300" style={{width:`${progress}%`,backgroundColor:brand}}/></div></div>;
}

function ImageAnswerCard({title,image,onClick,compact=false,brand}:{title:string;image:string;onClick:()=>void;compact?:boolean;brand:string}) {
  return (
    <button type="button" onClick={onClick} className="group overflow-hidden rounded-[4px] border border-neutral-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]">
      <div className="relative aspect-square w-full overflow-hidden">
        <Image src={image} alt={title} fill className="object-cover transition duration-300 group-hover:scale-[1.03]"/>
        <div className={`absolute inset-x-0 bottom-0 text-center ${compact?'px-2 py-2.5 md:px-2 md:py-3':'px-4 py-4'}`} style={{backgroundColor:`${brand}E6`}}>
          <span className={`block font-bold text-white ${compact?'text-xs leading-snug md:text-sm':'text-sm md:text-base'}`}><RT t={title}/></span>
        </div>
      </div>
    </button>
  );
}

function IconAnswerCard({title,icon:Icon,onClick,brand}:{title:string;icon:React.ComponentType<{className?:string}>;onClick:()=>void;brand:string}) {
  return (
    <button type="button" onClick={onClick} className="group flex aspect-square w-full flex-col items-center justify-center rounded-[4px] text-center text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]" style={{backgroundColor:brand}}>
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/10"><Icon className="h-8 w-8 text-white"/></div>
      <span className="px-4 text-base font-bold leading-snug md:text-lg"><RT t={title}/></span>
    </button>
  );
}

function trackFunnelStep(step:string, quizId:string) {
  try {
    // Only track on public-facing pages, never in the admin panel
    if(typeof window!=='undefined'&&window.location.pathname.startsWith('/admin'))return;
    const sessionId=(typeof window!=='undefined'&&(window as any).__quizSessionId)||null;
    fetch('/api/admin/quiz-funnel',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({step,session_id:sessionId,quiz_id:quizId})}).catch(()=>{});
  } catch {}
}

export default function Quiz({quizId='component_quiz'}:{quizId?:string}) {
  const [step,setStep]=useState<0|1|2|3|4>(0);
  const [answers,setAnswers]=useState<Answers>({});
  const [loading,setLoading]=useState(false);
  const [cfg,setCfg]=useState<CmsQuiz>(D);
  const sentLeadRef=useRef(false);
  const loadingTimeoutRef=useRef<ReturnType<typeof setTimeout>|null>(null);
  const trackedSteps=useRef<Set<string>>(new Set());

  useEffect(()=>{
    const pageId=quizId||'component_quiz';
    fetch(`/api/cms/public?page=${encodeURIComponent(pageId)}`)
      .then(r=>r.json())
      .then(json=>{
        if(!json.ok||!json.data)return;
        const m:Record<string,string>={};
        for(const e of json.data)m[`${e.section_key}::${e.field_key}`]=e.value;
        const v=(k:string,fb:string)=>m[k]||fb;
        setCfg({
          brand:v('colors::brand',D.brand),quiz_bg:v('colors::quiz_bg',D.quiz_bg),
          header_title:v('quiz_section::title',D.header_title),header_sub:v('quiz_section::subtitle',D.header_sub),
          q1_question:v('quiz_q1::question',D.q1_question),q1_subtitle:v('quiz_q1::subtitle',D.q1_subtitle),
          q1_opt1:v('quiz_q1::option_1',D.q1_opt1),q1_opt2:v('quiz_q1::option_2',D.q1_opt2),
          q1_img1:v('quiz_q1::img_1',D.q1_img1),q1_img2:v('quiz_q1::img_2',D.q1_img2),
          q2_question:v('quiz_q2::question',D.q2_question),
          q2_opt1:v('quiz_q2::option_1',D.q2_opt1),q2_opt2:v('quiz_q2::option_2',D.q2_opt2),
          q2_opt3:v('quiz_q2::option_3',D.q2_opt3),q2_opt4:v('quiz_q2::option_4',D.q2_opt4),
          q2_img1:v('quiz_q2::img_1',D.q2_img1),q2_img2:v('quiz_q2::img_2',D.q2_img2),
          q2_img3:v('quiz_q2::img_3',D.q2_img3),q2_img4:v('quiz_q2::img_4',D.q2_img4),
          q3_question:v('quiz_q3::question',D.q3_question),
          q3_opt1:v('quiz_q3::option_1',D.q3_opt1),q3_opt2:v('quiz_q3::option_2',D.q3_opt2),
          form_title:v('quiz_form::title',D.form_title),form_subtitle:v('quiz_form::subtitle',D.form_subtitle),
          form_name:v('quiz_form::name_label',D.form_name),form_email:v('quiz_form::email_label',D.form_email),
          form_phone:v('quiz_form::phone_label',D.form_phone),form_submit:v('quiz_form::submit_label',D.form_submit),
          form_privacy:v('quiz_form::privacy_text',D.form_privacy),
        });
      }).catch(()=>{});
  },[quizId]);

  useEffect(()=>{
    if(!trackedSteps.current.has('view')){
      trackedSteps.current.add('view');
      if(typeof window!=='undefined'){(window as any).__quizSessionId=Math.random().toString(36).slice(2);}
      trackFunnelStep('view',quizId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  const startLoadingStep=(data:Partial<Answers>)=>{
    setAnswers(prev=>({...prev,...data}));setLoading(true);setStep(3);
    if(!trackedSteps.current.has('q3')){trackedSteps.current.add('q3');trackFunnelStep('q3',quizId);}
    if(loadingTimeoutRef.current)clearTimeout(loadingTimeoutRef.current);
    loadingTimeoutRef.current=setTimeout(()=>{setLoading(false);setStep(4);
      if(!trackedSteps.current.has('form')){trackedSteps.current.add('form');trackFunnelStep('form',quizId);}
      loadingTimeoutRef.current=null;},1800);
  };

  const next=(data:Partial<Answers>)=>{
    if(step===2){startLoadingStep(data);return;}
    setAnswers(prev=>({...prev,...data}));
    const stepKey=step===0?'q1':step===1?'q2':null;
    if(stepKey&&!trackedSteps.current.has(stepKey)){trackedSteps.current.add(stepKey);trackFunnelStep(stepKey,quizId);}
    setStep(prev=>(prev+1) as 0|1|2|3|4);
  };

  const back=()=>{
    if(loading){if(loadingTimeoutRef.current){clearTimeout(loadingTimeoutRef.current);loadingTimeoutRef.current=null;}setLoading(false);setStep(2);return;}
    if(step===4){setStep(2);return;}
    setStep(prev=>(prev>0?(prev-1) as 0|1|2|3|4:0));
  };

  const submitLead=async(e:React.FormEvent<HTMLFormElement>)=>{
    e.preventDefault();
    const form=new FormData(e.currentTarget);
    const payload={ready:answers.ready??'',experience:answers.experience??'',lessonType:answers.lessonType??'',
      name:String(form.get('name')||'').trim(),email:String(form.get('email')||'').trim(),
      phone:String(form.get('phone')||'').trim(),hp:String(form.get('hp')||'').trim()};
    if(!payload.name||!payload.email||!payload.phone){alert('Bitte fülle alle Felder aus.');return;}
    if(!sentLeadRef.current){try{(window as any).fbq?.('track','Lead',payload);sentLeadRef.current=true;}catch{}}
    trackFunnelStep('submit',quizId);
    try{await fetch('/api/lead',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});}catch{}
    window.location.href='/danke';
  };

  const {brand,quiz_bg}=cfg;
  const lightGray='#6B6B6B';const graphite='#2F2F2F';

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="quiz-open-sans rounded-[4px]" style={{backgroundColor:quiz_bg}}>
        {step!==4&&<ProgressBar step={step} brand={brand}/>}
        <div className="mt-6 md:mt-8">

          {step===0&&(
            <section className="text-center">
              <h2 className="text-3xl font-extrabold md:text-4xl" style={{color:graphite}}><RT t={cfg.q1_question}/></h2>
              <p className="mx-auto mt-3 max-w-lg text-base" style={{color:lightGray}}><RT t={cfg.q1_subtitle}/></p>
              <div className="mx-auto mt-8 grid max-w-[520px] grid-cols-2 gap-3 md:gap-4">
                {[{opt:cfg.q1_opt1,img:cfg.q1_img1},{opt:cfg.q1_opt2,img:cfg.q1_img2}].map(({opt,img})=>(
                  <ImageAnswerCard key={opt} title={opt} image={img} compact brand={brand} onClick={()=>next({ready:opt})}/>
                ))}
              </div>
            </section>
          )}

          {step===1&&(
            <section className="text-center">
              <h2 className="text-3xl font-extrabold md:text-4xl" style={{color:graphite}}><RT t={cfg.q2_question}/></h2>
              <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
                {[{opt:cfg.q2_opt1,img:cfg.q2_img1},{opt:cfg.q2_opt2,img:cfg.q2_img2},{opt:cfg.q2_opt3,img:cfg.q2_img3},{opt:cfg.q2_opt4,img:cfg.q2_img4}].map(({opt,img})=>(
                  <ImageAnswerCard key={opt} title={opt} image={img} compact brand={brand} onClick={()=>next({experience:opt})}/>
                ))}
              </div>
              <div className="mt-6 text-center"><button type="button" onClick={back} className="text-sm underline underline-offset-4" style={{color:lightGray}}>Zurück</button></div>
            </section>
          )}

          {step===2&&(
            <section className="text-center">
              <h2 className="text-3xl font-extrabold md:text-4xl" style={{color:graphite}}><RT t={cfg.q3_question}/></h2>
              <div className="mx-auto mt-8 grid max-w-[520px] grid-cols-2 gap-3 md:gap-4">
                {[{opt:cfg.q3_opt1,icon:MapPin},{opt:cfg.q3_opt2,icon:Monitor}].map(({opt,icon})=>(
                  <IconAnswerCard key={opt} title={opt} icon={icon} brand={brand} onClick={()=>next({lessonType:opt})}/>
                ))}
              </div>
              <div className="mt-6 text-center"><button type="button" onClick={back} className="text-sm underline underline-offset-4" style={{color:lightGray}}>Zurück</button></div>
            </section>
          )}

          {step===3&&loading&&(
            <section className="py-10 text-center">
              <div className="mx-auto flex max-w-md flex-col items-center rounded-[4px] border border-neutral-200 bg-white px-6 py-10 shadow-sm">
                <div className="h-14 w-14 animate-spin rounded-full border-4 border-neutral-200" style={{borderTopColor:brand}}/>
                <h3 className="mt-6 text-2xl font-extrabold" style={{color:graphite}}>Einen Moment bitte ...</h3>
                <p className="mt-3 text-sm leading-7" style={{color:lightGray}}>Wir bereiten deine unverbindliche Probestunde vor.</p>
              </div>
              <div className="mt-6 text-center"><button type="button" onClick={back} className="text-sm underline underline-offset-4" style={{color:lightGray}}>Zurück</button></div>
            </section>
          )}

          {step===4&&(
            <section className="mx-auto max-w-2xl text-center">
              <div className="mx-auto mb-6 flex justify-center">
                <div className="relative h-28 w-28 overflow-hidden rounded-full md:h-32 md:w-32">
                  <Image src="/martin1.jpg" alt="Martin Krendl" fill className="object-cover"/>
                </div>
              </div>
              <h2 className="mt-3 text-3xl font-extrabold md:text-4xl" style={{color:graphite}}><RT t={cfg.form_title}/></h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-8 whitespace-pre-line" style={{color:lightGray}}>
                <RT t={cfg.form_subtitle}/>
              </p>
              <form onSubmit={submitLead} className="mx-auto mt-8 max-w-xl space-y-3">
                <input type="hidden" name="ready" value={answers.ready||''}/>
                <input type="hidden" name="experience" value={answers.experience||''}/>
                <input type="hidden" name="lessonType" value={answers.lessonType||''}/>
                <input type="text" name="hp" tabIndex={-1} autoComplete="off" className="hidden"/>
                <input className="h-12 w-full rounded-[4px] border border-neutral-300 bg-white px-4 outline-none transition focus:border-[color:var(--brand)]"
                  style={{color:graphite,['--brand' as any]:brand}} name="name" placeholder={cfg.form_name} required/>
                <input className="h-12 w-full rounded-[4px] border border-neutral-300 bg-white px-4 outline-none transition focus:border-[color:var(--brand)]"
                  style={{color:graphite,['--brand' as any]:brand}} type="email" name="email" placeholder={cfg.form_email} required/>
                <input className="h-12 w-full rounded-[4px] border border-neutral-300 bg-white px-4 outline-none transition focus:border-[color:var(--brand)]"
                  style={{color:graphite,['--brand' as any]:brand}} type="tel" name="phone" placeholder={cfg.form_phone} required pattern="^[0-9+()\s-]{6,}$"/>
                <Button type="submit" className="mt-2 h-12 w-full rounded-[4px] px-6 font-semibold text-white hover:opacity-95" style={{backgroundColor:brand}}>
                  {cfg.form_submit}
                </Button>
                <p className="text-sm" style={{color:lightGray}}>{cfg.form_privacy}</p>
                <div className="pt-2"><button type="button" onClick={back} className="text-sm underline underline-offset-4" style={{color:lightGray}}>Zurück</button></div>
              </form>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
