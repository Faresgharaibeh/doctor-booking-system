<?php

namespace App\Notifications;

use App\Models\Appointment;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class PatientAppointmentConfirmedNotification extends Notification
{
    public function __construct(public Appointment $appointment)
    {
        $this->appointment = $appointment->loadMissing(['patient', 'doctor']);
    }

    public function via($notifiable): array
    {
        // ✅ Email + Database (instant, no queue)
        return ['mail', 'database'];
    }

    public function toMail($notifiable): MailMessage
    {
        $a = $this->appointment;

        $doctorName = $a->doctor?->name ?? 'Doctor';
        $date = (string) $a->date;
        $start = $a->start_time ? substr((string)$a->start_time, 0, 5) : '—';
        $end = $a->end_time ? substr((string)$a->end_time, 0, 5) : '—';

        return (new MailMessage)
            ->subject("Your appointment is confirmed ✅")
            ->greeting("Hello " . ($a->patient?->name ?? ''))
            ->line("Your appointment has been confirmed.")
            ->line("Doctor: {$doctorName}")
            ->line("Date: {$date}")
            ->line("Time: {$start} - {$end}")
            ->action("View My Appointments", url("/appointments"))
            ->line("DoctorBook");
    }

    public function toDatabase($notifiable): array
    {
        $a = $this->appointment;

        return [
            'type' => 'patient_confirmed',
            'title' => 'Appointment confirmed ✅',
            'message' => 'Your appointment was confirmed by ' . ($a->doctor?->name ?? 'Doctor') . '.',
            'appointment_id' => $a->id,
            'date' => (string) $a->date,
            'start_time' => $a->start_time ? substr((string)$a->start_time, 0, 5) : null,
            'end_time' => $a->end_time ? substr((string)$a->end_time, 0, 5) : null,
            'status' => (string) $a->status,
            'action_url' => '/appointments',
        ];
    }
}