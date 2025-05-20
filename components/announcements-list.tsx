"use client"

import { useEffect, useState } from "react"
import { 
  AlertCircle, 
  Trash2, 
  PenToolIcon as Tools, 
  CableCarIcon as Elevator,
  PlusCircle,
  Edit,
  Save,
  X,
  ChevronDown,
  ChevronUp
} from "lucide-react"

interface Announcement {
  id: number;
  title: string;
  content: string;
  icon: string; // Store icon name as string
  priority: "high" | "medium" | "low";
}

// Icon options for the dropdown
const iconOptions = [
  { name: "trash", component: <Trash2 className="h-6 w-6" /> },
  { name: "tools", component: <Tools className="h-6 w-6" /> },
  { name: "elevator", component: <Elevator className="h-6 w-6" /> },
  { name: "alert", component: <AlertCircle className="h-6 w-6" /> },
];

// Get icon component by name
const getIconByName = (name: string, color: string) => {
  switch (name) {
    case "trash":
      return <Trash2 className={`h-6 w-6 ${color}`} />;
    case "tools":
      return <Tools className={`h-6 w-6 ${color}`} />;
    case "elevator":
      return <Elevator className={`h-6 w-6 ${color}`} />;
    case "alert":
      return <AlertCircle className={`h-6 w-6 ${color}`} />;
    default:
      return <AlertCircle className={`h-6 w-6 ${color}`} />;
  }
};

// Get color based on priority
const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "text-red-600";
    case "medium":
      return "text-blue-600";
    case "low":
      return "text-green-600";
    default:
      return "text-gray-600";
  }
};

// Default announcements
const defaultAnnouncements: Announcement[] = [
  {
    id: 1,
    title: "המקום מצולם",
    content: "המקום מצולם ומוקלט 24 שעות ביממה",
    icon: "camera",
    priority: "medium",
  },
  {
    id: 2,
    title: "פינוי גזם",
    content: "פינוי גזם ניתן להוציא החל מיום א׳ ב20:00 בערב ועד ליום ב׳ בבוקר",
    icon: "tools",
    priority: "low",
  },
  {
    id: 3,
    title: "ניקיון הבניין",
    content: "דיירים יקרים נא לשמור על ניקיון הבניין.",
    icon: "clean",
    priority: "high",
  },
];

export function AnnouncementsList() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  
  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formIcon, setFormIcon] = useState("alert");
  const [formPriority, setFormPriority] = useState<"high" | "medium" | "low">("medium");
  
  // Load announcements from localStorage or use defaults
  useEffect(() => {
    const savedAnnouncements = localStorage.getItem("announcements");
    if (savedAnnouncements) {
      setAnnouncements(JSON.parse(savedAnnouncements));
    } else {
      setAnnouncements(defaultAnnouncements);
      localStorage.setItem("announcements", JSON.stringify(defaultAnnouncements));
    }
  }, []);
  
  // Save announcements to localStorage whenever they change
  useEffect(() => {
    if (announcements.length > 0) {
      localStorage.setItem("announcements", JSON.stringify(announcements));
    }
  }, [announcements]);
  
  // Start adding a new announcement
  const handleAddNew = () => {
    setFormTitle("");
    setFormContent("");
    setFormIcon("alert");
    setFormPriority("medium");
    setEditingAnnouncement(null);
    setShowForm(true);
  };
  
  // Start editing an existing announcement
  const handleEdit = (announcement: Announcement) => {
    setFormTitle(announcement.title);
    setFormContent(announcement.content);
    setFormIcon(announcement.icon);
    setFormPriority(announcement.priority);
    setEditingAnnouncement(announcement);
    setShowForm(true);
  };
  
  // Delete an announcement
  const handleDelete = (id: number) => {
    const updatedAnnouncements = announcements.filter(item => item.id !== id);
    setAnnouncements(updatedAnnouncements);
  };
  
  // Save a new or edited announcement
  const handleSave = () => {
    if (!formTitle.trim() || !formContent.trim()) {
      alert("יש למלא כותרת ותוכן");
      return;
    }
    
    if (editingAnnouncement) {
      // Update existing announcement
      const updatedAnnouncements = announcements.map(item => 
        item.id === editingAnnouncement.id 
          ? {
              ...item,
              title: formTitle,
              content: formContent,
              icon: formIcon,
              priority: formPriority
            }
          : item
      );
      setAnnouncements(updatedAnnouncements);
    } else {
      // Add new announcement
      const newId = announcements.length > 0 
        ? Math.max(...announcements.map(a => a.id)) + 1 
        : 1;
        
      const newAnnouncement: Announcement = {
        id: newId,
        title: formTitle,
        content: formContent,
        icon: formIcon,
        priority: formPriority
      };
      
      setAnnouncements([...announcements, newAnnouncement]);
    }
    
    setShowForm(false);
    setEditingAnnouncement(null);
  };
  
  // Cancel form
  const handleCancel = () => {
    setShowForm(false);
    setEditingAnnouncement(null);
  };
  
  // Toggle editing mode
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    if (showForm) {
      setShowForm(false);
      setEditingAnnouncement(null);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-gray-100 p-4 border-b flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-500" />
          הודעות חשובות
        </h2>
        
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button 
                onClick={handleAddNew}
                className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs"
              >
                <PlusCircle className="h-3 w-3" />
                <span>הוספה</span>
              </button>
              <button 
                onClick={toggleEditMode}
                className="flex items-center gap-1 bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs"
              >
                <X className="h-3 w-3" />
                <span>סיום עריכה</span>
              </button>
            </>
          ) : (
            <button 
              onClick={toggleEditMode}
              className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
            >
              <Edit className="h-3 w-3" />
              <span>עריכה</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {showForm && (
          <div className="mb-3 p-3 border rounded-lg bg-white">
            <h3 className="text-base font-bold mb-2">
              {editingAnnouncement ? "עריכת הודעה" : "הודעה חדשה"}
            </h3>
            
            <div className="mb-2">
              <label className="block text-sm font-bold mb-1">כותרת</label>
              <input 
                type="text" 
                className="w-full p-1 border rounded text-sm" 
                value={formTitle} 
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="כותרת ההודעה"
                dir="rtl"
              />
            </div>
            
            <div className="mb-2">
              <label className="block text-xs font-bold mb-1">תוכן</label>
              <textarea 
                className="w-full p-1 border rounded text-sm" 
                value={formContent} 
                onChange={(e) => setFormContent(e.target.value)}
                placeholder="תוכן ההודעה"
                rows={3}
                dir="rtl"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <label className="block text-xs font-bold mb-1">סמל</label>
                <select 
                  className="w-full p-1 border rounded text-sm" 
                  value={formIcon} 
                  onChange={(e) => setFormIcon(e.target.value)}
                  dir="rtl"
                >
                  <option value="trash">פח אשפה</option>
                  <option value="tools">כלים</option>
                  <option value="elevator">מעלית</option>
                  <option value="alert">התראה</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold mb-1">דחיפות</label>
                <select 
                  className="w-full p-1 border rounded text-sm" 
                  value={formPriority} 
                  onChange={(e) => setFormPriority(e.target.value as "high" | "medium" | "low")}
                  dir="rtl"
                >
                  <option value="high">גבוהה</option>
                  <option value="medium">בינונית</option>
                  <option value="low">נמוכה</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <button 
                onClick={handleCancel}
                className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-xs"
              >
                ביטול
              </button>
              <button 
                onClick={handleSave}
                className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs flex items-center gap-1"
              >
                <Save className="h-3 w-3" />
                שמירה
              </button>
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          {announcements.length === 0 ? (
            <div className="text-center p-3 text-gray-500 text-sm">
              אין הודעות להצגה
            </div>
          ) : (
            announcements.map((announcement) => (
              <div
                key={announcement.id}
                className={`p-2 rounded-lg border ${
                  announcement.priority === "high"
                    ? "border-red-200 bg-red-50"
                    : announcement.priority === "medium"
                    ? "border-yellow-200 bg-yellow-50"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <div className="flex items-start gap-2">
                  <div className="mt-0">
                    {getIconByName(announcement.icon, getPriorityColor(announcement.priority))}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-0.5">{announcement.title}</h3>
                    <p className="text-xl text-gray-700">{announcement.content}</p>
                  </div>
                  
                  {isEditing && (
                    <div className="flex gap-1">
                      <button 
                        onClick={() => handleEdit(announcement)}
                        className="p-1 bg-blue-100 hover:bg-blue-200 rounded"
                        title="ערוך"
                      >
                        <Edit className="h-3 w-3 text-blue-600" />
                      </button>
                      <button 
                        onClick={() => handleDelete(announcement.id)}
                        className="p-1 bg-red-100 hover:bg-red-200 rounded"
                        title="מחק"
                      >
                        <Trash2 className="h-3 w-3 text-red-600" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
