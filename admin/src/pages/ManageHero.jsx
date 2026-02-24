import React, { useState, useEffect } from 'react';
import axios , {BASE_URL} from '../utils/axios';
import { Save, User, Layout, Loader2, Upload } from 'lucide-react';

export default function ManageHero() {
  const [settings, setSettings] = useState({ 
  
    lawyers: [ { name: '', title: '', quote: '', desc: '', image: '' }, { name: '', title: '', quote: '', desc: '', image: '' } ] 
  });
  const [files, setFiles] = useState({  lawyer0: null, lawyer1: null });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios.get('/hero').then(res => {
      if (res.data) setSettings(res.data);
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const formData = new FormData();
    
    // Append Files
  
    if (files.lawyer0) formData.append('lawyer0', files.lawyer0);
    if (files.lawyer1) formData.append('lawyer1', files.lawyer1);

    // Append other data as strings
  
    formData.append('lawyers', JSON.stringify(settings.lawyers));

    try {
      await axios.put('/hero', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert("Updated Successfully!");
      window.location.reload(); // Refresh to show new images
    } catch (err) { alert("Error saving data"); }
    setSaving(false);
  };

  const updateLawyerText = (index, field, value) => {
    const newLawyers = [...settings.lawyers];
    newLawyers[index][field] = value;
    setSettings({ ...settings, lawyers: newLawyers });
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="p-8 max-w-5xl mx-auto font-sans text-stone-900">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif font-bold text-stone-900">Hero Section Management</h1>
        <button onClick={handleSave} disabled={saving} className="bg-stone-900 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-black transition shadow-md">
           {saving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>} Save All
        </button>
      </div>


      {/* --- LAWYERS UPLOAD --- */}
      <div className="grid md:grid-cols-2 gap-8">
        {settings.lawyers.map((lawyer, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
            <h3 className="font-bold border-b pb-2 mb-4 text-stone-600 flex items-center gap-2"><User size={18}/> Lawyer {i+1}</h3>
            
            <div className="flex gap-4 mb-4 items-center">
               <div className="w-16 h-16 rounded-full border overflow-hidden bg-stone-50 shrink-0">
                  <img src={`${BASE_URL}${lawyer.image}`} alt="Lawyer" className="w-full h-full object-cover" />
               </div>
               <label className="flex-1 border border-stone-200 rounded p-2 text-center cursor-pointer hover:bg-stone-50 transition">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter">Change Photo</span>
                  <input type="file" className="hidden" onChange={(e) => setFiles({...files, [`lawyer${i}`]: e.target.files[0]})} />
                  {files[`lawyer${i}`] && <div className="text-[9px] text-green-600 truncate max-w-[100px] mx-auto">{files[`lawyer${i}`].name}</div>}
               </label>
            </div>

            <div className="space-y-3">
               <input placeholder="Name" value={lawyer.name} onChange={e => updateLawyerText(i, 'name', e.target.value)} className="w-full p-2 border rounded text-sm bg-stone-50" />
               <input placeholder="Title" value={lawyer.title} onChange={e => updateLawyerText(i, 'title', e.target.value)} className="w-full p-2 border rounded text-sm bg-stone-50" />
               <input placeholder="Quote" value={lawyer.quote} onChange={e => updateLawyerText(i, 'quote', e.target.value)} className="w-full p-2 border rounded text-sm bg-stone-50 italic" />
               <textarea placeholder="Bio" value={lawyer.desc} onChange={e => updateLawyerText(i, 'desc', e.target.value)} className="w-full p-2 border rounded text-sm bg-stone-50 h-20 resize-none" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}