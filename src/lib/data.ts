export type Doctor = {
  id: number;
  name: string;
  avatar: string;
  title: string;
};

export const doctors: Doctor[] = [
  { id: 1, name: 'Dr. Evelyn Reed', avatar: 'https://placehold.co/100x100/E8DAEF/4A235A?text=ER', title: 'Cardiologist' },
  { id: 2, name: 'Dr. Kenji Tanaka', avatar: 'https://placehold.co/100x100/D4E6F1/1A5276?text=KT', title: 'Neurologist' },
  { id: 3, name: 'Dr. Sofia Rossi', avatar: 'https://placehold.co/100x100/D1F2EB/0E6251?text=SR', title: 'General Surgeon' },
];

export const currentUserId = 1; // This is the current logged-in user (Dr. Evelyn Reed)

export type Patient = {
  id: number;
  name: string;
  avatar: string;
  age: number;
  diagnosis: string;
  medications: string[];
};

export const patients: Patient[] = [
    {
        id: 1,
        name: 'Eleanor Vance',
        avatar: 'https://placehold.co/100x100/A3E4D7/4A5568?text=EV',
        age: 45,
        diagnosis: 'Diabetic Retinopathy',
        medications: ['Lisinopril', 'Aflibercept'],
    },
    {
        id: 2,
        name: 'Leo Thorne',
        avatar: 'https://placehold.co/100x100/5DADE2/FFFFFF?text=LT',
        age: 6,
        diagnosis: 'Amblyopia',
        medications: ['Atropine drops', 'Vision Patch'],
    },
    {
        id: 3,
        name: 'Isabella Rossi',
        avatar: 'https://placehold.co/100x100/F0F4F8/4A5568?text=IR',
        age: 68,
        diagnosis: 'Primary open-angle glaucoma',
        medications: ['Latanoprost', 'Timolol'],
    },
    {
        id: 4,
        name: 'James O\'Connell',
        avatar: 'https://placehold.co/100x100/A3E4D7/4A5568?text=JO',
        age: 71,
        diagnosis: 'Post-op Cataract Surgery',
        medications: ['Prednisolone drops', 'Ibuprofen'],
    },
];

export type SoapNotes = {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
};

export type SoapEdit = {
    editorId: number;
    timestamp: string;
    previousContent: SoapNotes;
};

export type SoapAttachedFile = {
  name: string;
  url: string;
  size: string;
};

export type SoapAttachedFileGroups = {
  subjective: SoapAttachedFile[];
  objective: SoapAttachedFile[];
  assessment: SoapAttachedFile[];
  plan: SoapAttachedFile[];
};


export type Message = {
  id: number;
  senderId: number; // Corresponds to Doctor['id']
  patientId: number | null; // Corresponds to Patient['id']
  type: 'text' | 'image' | 'pdf' | 'audio' | 'dicom' | 'soap';
  content: string;
  timestamp: string;
  fileName?: string;
  fileSize?: string;
  replyTo?: number;
  soapData?: SoapNotes;
  attachedFiles?: SoapAttachedFileGroups;
  isEdited?: boolean;
  editHistory?: SoapEdit[];
  isArchived?: boolean;
  latestVersionId?: number;
  originalMessageId?: number;
};

export type Chat = {
    id: number;
    name: string;
    avatar: string;
    messages: Message[];
}

export const quickReplies: string[] = [
  "What's your opinion on the latest lab results?",
  "I'll take the lead on this case.",
  "Can someone cover for me this afternoon?",
  "Please review the attached MRI.",
  "Let's schedule a video call to discuss.",
  "I agree with the proposed treatment plan.",
];

const initialSoapNoteContent = `**SOAP Note for James O'Connell**

**S:** Patient reports vision is clearer. No pain or discomfort.

**O:** Visual acuity 20/25 in the operated eye. IOP is 15 mmHg.

**A:** Excellent post-operative recovery.

**P:** Continue steroid drops for 1 more week. Follow-up in 1 month.`;


export const chats: Chat[] = [
  {
    id: 1,
    name: 'Retina',
    avatar: 'https://placehold.co/100x100/A3E4D7/4A5568?text=RE',
    messages: [
      { id: 1, senderId: 2, patientId: 1, type: 'text', content: "Morning team. Reviewing Eleanor Vance's file. Her vision has worsened.", timestamp: '9:05 AM' },
      { id: 2, senderId: 1, patientId: 1, type: 'text', content: "I've noticed that too, Kenji. I think we should consider another injection.", timestamp: '9:07 AM', replyTo: 1 },
      { id: 3, senderId: 2, patientId: 1, type: 'text', content: "Agreed. Let's get her in. I've also ordered a new OCT scan. Here are the results from last week.", timestamp: '9:15 AM' },
      { id: 4, senderId: 2, patientId: 1, type: 'pdf', content: '#', fileName: 'oct_scan_ev.pdf', fileSize: '2.1 MB', timestamp: '9:16 AM'},
      { id: 5, senderId: 1, patientId: 1, type: 'image', content: 'https://placehold.co/400x300', fileName: 'retinal-scan.png', fileSize: '128 KB', timestamp: '9:20 AM' },
    ],
  },
  {
    id: 2,
    name: 'PediaOphtha',
    avatar: 'https://placehold.co/100x100/5DADE2/FFFFFF?text=PO',
    messages: [
      { id: 1, senderId: 3, patientId: 2, type: 'text', content: "Regarding Leo Thorne, his visual acuity is attached. Seems stable but I'd like a second opinion on his patching schedule.", timestamp: 'Yesterday' },
      { id: 2, senderId: 3, patientId: 2, type: 'pdf', content: '#', fileName: 'vision_chart_leo.pdf', fileSize: '450 KB', timestamp: 'Yesterday' },
      { id: 3, senderId: 1, patientId: 2, type: 'text', content: "Thanks, Sofia. I've reviewed it. The schedule seems appropriate for now. Let's monitor for another week.", timestamp: '10:30 AM' },
    ],
  },
  {
    id: 3,
    name: 'Glaucoma',
    avatar: 'https://placehold.co/100x100/F0F4F8/4A5568?text=GL',
    messages: [
      { id: 1, senderId: 2, patientId: 3, type: 'text', content: "Isabella Rossi needs a refill for her Latanoprost. Can someone approve the prescription?", timestamp: '3 days ago' },
      { id: 2, senderId: 1, patientId: 3, type: 'text', content: "I'm on it. Prescription sent to the pharmacy.", timestamp: '3 days ago' },
    ],
  },
    {
    id: 4,
    name: 'Cataract Surgery',
    avatar: 'https://placehold.co/100x100/A3E4D7/4A5568?text=CS',
    messages: [
      { id: 1, senderId: 1, patientId: 4, type: 'text', content: "Morning all. How's James O'Connell's recovery progressing post-op?", timestamp: 'Yesterday' },
      { id: 2, senderId: 3, patientId: 4, type: 'audio', content: '#', fileName: 'james_update.mp3', fileSize: '1.2 MB', timestamp: 'Yesterday' },
      { id: 3, senderId: 3, patientId: 4, type: 'text', content: "That was my voice note from yesterday's rounds. He's doing well. Vision is 20/25. Here is his latest scan.", timestamp: '8:00 AM'},
      { id: 4, senderId: 3, patientId: 4, type: 'dicom', content: '#', fileName: 'cornea_scan.dcm', fileSize: '15.7 MB', timestamp: '8:01 AM' },
      { 
        id: 5, 
        senderId: 1, 
        patientId: 4, 
        type: 'soap', 
        content: initialSoapNoteContent,
        soapData: {
            subjective: "Patient reports vision is clearer. No pain or discomfort.",
            objective: "Visual acuity 20/25 in the operated eye. IOP is 15 mmHg.",
            assessment: "Excellent post-operative recovery.",
            plan: "Continue steroid drops for 1 more week. Follow-up in 1 month."
        },
        attachedFiles: {
            subjective: [],
            objective: [],
            assessment: [],
            plan: []
        },
        isEdited: false,
        editHistory: [],
        timestamp: '8:15 AM'
      },
    ],
  },
];
