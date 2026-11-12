import { lazy, Suspense } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, Navigate } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'
import { projectExperience } from '../data/projectExperiences'
import '../styles/typeface-page.css'
import '../styles/glyph-editor.css'
import '../styles/type-workshop.css'
const GlyphEditor=lazy(()=>import('../components/GlyphEditor'))
export default function TypefaceWorkshopPage(){
  if(projectExperience('typeface')?.status!=='approved')return <Navigate to="/typeface" replace/>
  return <main className="type-workshop typeface-page" id="main-content"><Helmet><title>Butler’s Slice workshop · Parth Pawar</title></Helmet><header className="tw-header"><div><h1>Butler’s Slice</h1><p>Type, inspect and reshape original font outlines.</p></div><Link className="glass-action" to="/project-experiences">All experiences</Link><Link className="glass-action" to="/typeface">Case study</Link><ThemeToggle/></header><Suspense fallback={<p role="status">Preparing the type workshop…</p>}><GlyphEditor workshop/></Suspense></main>
}
