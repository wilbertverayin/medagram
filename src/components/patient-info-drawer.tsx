import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Patient } from "@/lib/data";
import { Separator } from "./ui/separator";
import { User, Cake, Stethoscope as DiagnosisIcon, Pill } from "lucide-react";

interface PatientInfoDrawerProps {
  patient: Patient;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export default function PatientInfoDrawer({ patient, isOpen, onOpenChange }: PatientInfoDrawerProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:w-[440px] p-0 flex flex-col">
        <SheetHeader className="p-6 text-left">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={patient.avatar} alt={patient.name} data-ai-hint="person portrait" />
              <AvatarFallback className="text-2xl">{patient.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div>
              <SheetTitle className="text-2xl font-bold font-headline">{patient.name}</SheetTitle>
              <SheetDescription>Patient Overview</SheetDescription>
            </div>
          </div>
        </SheetHeader>
        <Separator />
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          <InfoRow icon={User} label="Name" value={patient.name} />
          <InfoRow icon={Cake} label="Age" value={`${patient.age} years old`} />
          <InfoRow icon={DiagnosisIcon} label="Diagnosis" value={patient.diagnosis} />
          <div>
             <div className="flex items-center text-sm font-medium text-muted-foreground mb-2">
                <Pill className="h-4 w-4 mr-3" />
                <span>Current Medications</span>
            </div>
            <div className="flex flex-wrap gap-2 pl-7">
                {patient.medications.map(med => (
                    <Badge key={med} variant="secondary" className="text-base py-1 px-3 rounded-full">{med}</Badge>
                ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

const InfoRow = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string }) => (
    <div className="flex items-start">
        <div className="flex items-center w-36 text-sm font-medium text-muted-foreground">
            <Icon className="h-4 w-4 mr-3" />
            <span>{label}</span>
        </div>
        <p className="flex-1 text-base text-foreground">{value}</p>
    </div>
)
