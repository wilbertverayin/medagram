import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import type { Patient } from "@/lib/data"
import { Info, ArrowLeft } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ChatHeaderProps {
    chatName: string;
    patients: Patient[];
    selectedPatientId: number | null;
    onSelectPatient: (patientId: number | null) => void;
    onInfoClick: () => void;
    onBack?: () => void;
}

export default function ChatHeader({ chatName, patients, selectedPatientId, onSelectPatient, onInfoClick, onBack }: ChatHeaderProps) {
    
    const selectedPatient = patients.find(p => p.id === selectedPatientId);

    return (
        <div className="flex items-center justify-between p-4 border-b bg-card gap-4">
            <div className="flex items-center gap-3 flex-shrink-0">
                {onBack && (
                    <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden" aria-label="Back to chat list">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                )}
                <div>
                    <h2 className="text-lg font-semibold text-foreground">{chatName}</h2>
                    <p className="text-sm text-muted-foreground">Doctor Collaboration Channel</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                 <Select
                    value={selectedPatientId?.toString() ?? 'all'}
                    onValueChange={(value) => onSelectPatient(value === 'all' ? null : Number(value))}
                 >
                    <SelectTrigger className="w-[180px] md:w-[220px] bg-card">
                        <SelectValue placeholder="Filter by patient..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Patients</SelectItem>
                        {patients.map(patient => (
                            <SelectItem key={patient.id} value={patient.id.toString()}>
                                {patient.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button variant="ghost" size="icon" onClick={onInfoClick} aria-label="Show patient information" disabled={!selectedPatientId}>
                    <Info className="h-5 w-5" />
                </Button>
            </div>
        </div>
    )
}
