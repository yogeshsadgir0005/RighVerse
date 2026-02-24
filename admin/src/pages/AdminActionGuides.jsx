import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import { Plus, Trash2, Save, Loader2 } from 'lucide-react';

export default function AdminActionGuides() {
  const [guides, setGuides] = useState([]);
  const [title, setTitle] = useState('');
  const [steps, setSteps] = useState(['']); // Start with one empty step
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchGuides(); }, []);

  const fetchGuides = async () => {
    try {
      const res = await axios.get('/action-guides');
      setGuides(res.data);
    } catch (err) { console.error(err); }
  };

  const handleStepChange = (index, value) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  };

  const addStepField = () => setSteps([...steps, '']);
  
  const removeStepField = (index) => {
    const newSteps = steps.filter((_, i) => i !== index);
    setSteps(newSteps.length ? newSteps : ['']);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const filteredSteps = steps.filter(s => s.trim() !== '');
    if (!title.trim() || filteredSteps.length === 0) return alert("Title and at least 1 step required.");
    
    setLoading(true);
    try {
      await axios.post('/action-guides', { title, steps: filteredSteps });
      setTitle('');
      setSteps(['']);
      fetchGuides();
    } catch (err) { alert("Failed to add guide"); }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Delete this guide?")) return;
    try {
      await axios.delete(`/action-guides/${id}`);
      fetchGuides();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 font-sans text-[#785F3F]">
      <h1 className="text-3xl font-serif font-bold text-[#B89A6A] mb-8">Manage "Know What To Do"</h1>
      
      {/* ADD FORM */}
      <form onSubmit={handleSubmit} className="bg-[#FBF8F2] p-8 rounded-[24px] border border-[#D2C4AE] shadow-sm mb-12">
        <h2 className="text-xl font-bold mb-4">Add New Guide</h2>
        <input 
          type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Situation Title (e.g., Arrested by Police?)" 
          className="w-full p-4 rounded-xl border border-[#D2C4AE] mb-6 focus:outline-none focus:border-[#B89A6A]" required 
        />
        
        <div className="space-y-4 mb-6">
          <label className="font-bold text-sm uppercase tracking-widest text-[#B89A6A]">Steps</label>
          {steps.map((step, index) => (
            <div key={index} className="flex gap-3">
              <span className="w-10 flex shrink-0 items-center justify-center bg-[#E9E3D9] rounded-xl font-bold">{index + 1}</span>
              <input 
                type="text" value={step} onChange={(e) => handleStepChange(index, e.target.value)} 
                placeholder={`Step ${index + 1} description...`} className="flex-1 p-3 rounded-xl border border-[#D2C4AE] focus:outline-none focus:border-[#B89A6A]" required 
              />
              <button type="button" onClick={() => removeStepField(index)} className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"><Trash2 size={20}/></button>
            </div>
          ))}
        </div>
        
        <div className="flex justify-between items-center pt-4 border-t border-[#D2C4AE]/50">
          <button type="button" onClick={addStepField} className="flex items-center gap-2 text-[#B89A6A] font-bold text-sm hover:text-[#785F3F] transition-colors"><Plus size={16}/> Add Another Step</button>
          <button type="submit" disabled={loading} className="bg-[#333333] text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest text-sm flex items-center gap-2 hover:bg-[#B89A6A] transition-all">
            {loading ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>} Save Guide
          </button>
        </div>
      </form>

      {/* LIST EXISTING GUIDES */}
      <div className="space-y-4">
        {guides.map(guide => (
          <div key={guide._id} className="bg-white p-6 rounded-[16px] border border-[#D2C4AE] flex justify-between items-center shadow-sm">
             <div>
               <h3 className="font-bold text-xl text-[#785F3F] mb-1">{guide.title}</h3>
               <p className="text-sm text-[#D2C4AE] font-bold">{guide.steps.length} Steps configured</p>
             </div>
             <button onClick={() => handleDelete(guide._id)} className="p-3 text-red-500 hover:bg-red-50 rounded-full transition-colors"><Trash2 size={20}/></button>
          </div>
        ))}
      </div>
    </div>
  );
}