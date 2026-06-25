"use client"

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Patient, Message, SoapNotes, Doctor } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Badge } from './ui/badge';
import { Paperclip, X, Download } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export type AttachedFiles = {
    subjective: File[];
    objective: File[];
    assessment: File[];
    plan: File[];
};

interface SoapFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  patients: Patient[];
  onSave: (notes: SoapNotes, files: AttachedFiles, patient: Patient) => void;
  messageToEdit: Message | null;
  initialPatientId: number | null;
  doctors: Doctor[];
}

const initialNotes: SoapNotes = {
  subjective: '',
  objective: '',
  assessment: '',
  plan: '',
};

const initialFiles: AttachedFiles = {
    subjective: [],
    objective: [],
    assessment: [],
    plan: [],
};

export default function SoapForm({ isOpen, onOpenChange, patients, onSave, messageToEdit, initialPatientId, doctors }: SoapFormProps) {
  const [notes, setNotes] = useState<SoapNotes>(initialNotes);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFiles>(initialFiles);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [activeAttachmentSection, setActiveAttachmentSection] = useState<keyof AttachedFiles | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const selectedPatient = selectedPatientId ? patients.find(p => p.id === selectedPatientId) : null;
  const isEditing = !!messageToEdit;

  useEffect(() => {
    if (isOpen) {
      if (messageToEdit) { // Editing an existing note
        setSelectedPatientId(messageToEdit.patientId);
        setNotes(messageToEdit.soapData || initialNotes);
        setAttachedFiles(initialFiles);
      } else { // Creating a new note
        setSelectedPatientId(initialPatientId);
        if (initialPatientId) {
          const savedNotes = localStorage.getItem(`soap-notes-${initialPatientId}`);
          if (savedNotes) {
            try {
              setNotes(JSON.parse(savedNotes));
            } catch (e) {
              setNotes(initialNotes);
            }
          } else {
            setNotes(initialNotes);
          }
        } else {
          setNotes(initialNotes);
        }
        setAttachedFiles(initialFiles);
      }
    }
  }, [isOpen, messageToEdit, initialPatientId]);

  useEffect(() => {
    if (isOpen && !isEditing && selectedPatientId) {
      localStorage.setItem(`soap-notes-${selectedPatientId}`, JSON.stringify(notes));
    }
  }, [notes, isOpen, isEditing, selectedPatientId]);


  const handleSave = () => {
    if (!selectedPatient) {
        toast({
            title: "Patient Not Selected",
            description: "Please select a patient before saving the SOAP note.",
            variant: "destructive"
        });
        return;
    }

    onSave(notes, attachedFiles, selectedPatient);

    if (!isEditing && selectedPatientId) {
        localStorage.removeItem(`soap-notes-${selectedPatientId}`);
    }
    onOpenChange(false);
  };
  
  const handleTextChange = (field: keyof SoapNotes, value: string) => {
    setNotes(prev => ({...prev, [field]: value}));
  }

  const handleFileAttachClick = (section: keyof AttachedFiles) => {
    setActiveAttachmentSection(section);
    fileInputRef.current?.click();
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && activeAttachmentSection) {
      setAttachedFiles(prev => ({
          ...prev,
          [activeAttachmentSection]: [...prev[activeAttachmentSection], ...Array.from(event.target.files!)],
      }));
    }
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleRemoveNewFile = (section: keyof AttachedFiles, fileToRemove: File) => {
    setAttachedFiles(prev => ({
        ...prev,
        [section]: prev[section].filter(file => file !== fileToRemove)
    }));
  }

  const renderAttachmentSection = (section: keyof AttachedFiles) => (
    <div className="grid gap-2 content-start mt-2">
        <div className="flex flex-wrap gap-2">
            {isEditing && messageToEdit?.attachedFiles?.[section].map((file, index) => (
                 <Badge key={`existing-${index}`} variant="outline" className="flex items-center gap-2">
                    <span className="max-w-[150px] truncate text-muted-foreground">{file.name}</span>
                    <a href={file.url} download={file.name} className="rounded-full hover:bg-muted-foreground/20 p-0.5">
                        <Download className="h-3 w-3 text-muted-foreground" />
                    </a>
                </Badge>
            ))}
            {attachedFiles[section].map((file, index) => (
                <Badge key={`new-${index}`} variant="secondary" className="flex items-center gap-2">
                    <span className="max-w-[150px] truncate">{file.name}</span>
                    <button onClick={() => handleRemoveNewFile(section, file)} className="rounded-full hover:bg-muted-foreground/20 p-0.5">
                        <X className="h-3 w-3" />
                    </button>
                </Badge>
            ))}
        </div>
        <Button variant="outline" size="sm" onClick={() => handleFileAttachClick(section)} className="mt-1 w-fit" disabled={!selectedPatientId}>
            <Paperclip className="mr-2 h-4 w-4" />
            Attach File
        </Button>
    </div>
  );
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-screen h-screen max-w-full max-h-full sm:w-[95vw] sm:max-w-[1200px] sm:h-[90vh] sm:rounded-lg flex flex-col bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit SOAP Note' : 'Create SOAP Note'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Edit the SOAP note. Changes will be tracked.' : 'Create a new SOAP note. Select a patient to begin. The note is auto-saved locally.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 flex-1 overflow-y-auto pr-6 -mr-4">
            <div className="md:col-span-2 mb-2">
              <Label htmlFor="patient-select">Patient</Label>
              <Select onValueChange={(value) => setSelectedPatientId(Number(value))} value={selectedPatientId?.toString()} disabled={isEditing}>
                <SelectTrigger id="patient-select" className="mt-1 bg-background">
                  <SelectValue placeholder="Select a patient..." />
                </SelectTrigger>
                <SelectContent>
                  {patients.map(p => (
                    <SelectItem key={p.id} value={p.id.toString()}>{p.name} - {p.diagnosis}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2 content-start">
                <Label htmlFor="subjective">Subjective</Label>
                <Textarea 
                    id="subjective" 
                    placeholder="Patient's chief complaint, history of present illness..." 
                    value={notes.subjective}
                    onChange={(e) => handleTextChange('subjective', e.target.value)}
                    className="h-32 bg-background"
                    disabled={!selectedPatientId}
                />
                {renderAttachmentSection('subjective')}
            </div>
            <div className="grid gap-2 content-start">
                <Label htmlFor="objective">Objective</Label>
                <Textarea 
                    id="objective" 
                    placeholder="Vital signs, physical exam findings, lab results..." 
                    value={notes.objective}
                    onChange={(e) => handleTextChange('objective', e.target.value)}
                    className="h-32 bg-background"
                    disabled={!selectedPatientId}
                />
                {renderAttachmentSection('objective')}
            </div>
            <div className="grid gap-2 content-start">
                <Label htmlFor="assessment">Assessment</Label>
                <Textarea 
                    id="assessment" 
                    placeholder="Primary diagnosis and any differential diagnoses..." 
                    value={notes.assessment}
                    onChange={(e) => handleTextChange('assessment', e.target.value)}
                    className="h-32 bg-background"
                    disabled={!selectedPatientId}
                />
                {renderAttachmentSection('assessment')}
            </div>
            <div className="grid gap-2 content-start">
                <Label htmlFor="plan">Plan</Label>
                <Textarea 
                    id="plan" 
                    placeholder="Treatment plan, further tests, patient education..." 
                    value={notes.plan}
                    onChange={(e) => handleTextChange('plan', e.target.value)}
                    className="h-32 bg-background"
                    disabled={!selectedPatientId}
                />
                {renderAttachmentSection('plan')}
            </div>
        </div>
        <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleFileChange} />
        <DialogFooter className="mt-4 flex justify-end w-full">
            <div className='flex gap-2'>
                <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button onClick={handleSave} disabled={!selectedPatientId}>
                    {isEditing ? 'Save & Update Note' : 'Save & Send Note'}
                </Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
