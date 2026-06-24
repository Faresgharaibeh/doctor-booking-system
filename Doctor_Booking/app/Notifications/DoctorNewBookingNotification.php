<?php

namespace App\Notifications;

use App\Models\Appointment;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class DoctorNewBookingNotification extends Notification
{
    public function __construct(public Appointment $appointment)
    {
        $this->appointment = $appointment->loadMissing(['patient', 'doctor', 'doctor.user']);
    }

    public function via($notifiable): array
    {
        // ✅ Email + DB notification (instant)
        return ['mail', 'database'];
    }

    public function toMail($notifiable): MailMessage
    {
        $a = $this->appointment;

        $patientName = $a->patient?->name ?? 'Patient';
        $date = (string) $a->date;
        $start = $a->start_time ? substr((string)$a->start_time, 0, 5) : '—';
        $end = $a->end_time ? substr((string)$a->end_time, 0, 5) : '—';

        return (new MailMessage)
            ->subject("New booking: {$patientName} • {$date} {$start}-{$end}")
            ->greeting("Hello Dr. " . ($a->doctor?->name ?? ''))
            ->line("You have a new appointment booking.")
            ->line("Patient: {$patientName}")
            ->line("Date: {$date}")
            ->line("Time: {$start} - {$end}")
            ->line("Status: " . strtoupper((string) $a->status))
            ->action("Open Doctor Appointments", url("/doctor/appointments"))
            ->line("DoctorBook");
    }

    public function toDatabase($notifiable): array
    {
        $a = $this->appointment;

        return [
            'type' => 'doctor_new_booking',
            'title' => 'New booking received',
            'message' => ($a->patient?->name ?? 'Patient') . ' booked an appointment.',
            'appointment_id' => $a->id,
            'date' => (string) $a->date,
            'start_time' => $a->start_time ? substr((string)$a->start_time, 0, 5) : null,
            'end_time' => $a->end_time ? substr((string)$a->end_time, 0, 5) : null,
            'status' => (string) $a->status,
            'action_url' => '/doctor/appointments',
        ];
    }
}