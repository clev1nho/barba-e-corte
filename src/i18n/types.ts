export type Language = "pt" | "en" | "es";

export interface Dictionary {
  // Nav / Footer
  nav_home: string;
  nav_book: string;
  nav_admin: string;

  // Hero
  hero_default_name: string;
  hero_default_subtitle: string;
  hero_book_cta: string;
  hero_whatsapp_cta: string;
  hero_opening_hours_label: string;

  // About
  about_title: string;
  about_address_label: string;
  about_default_address: string;
  about_map_button: string;

  // Categories / Services
  services_default_title: string;
  services_default_subtitle: string;

  // Gallery
  gallery_title: string;
  gallery_subtitle: string;

  // Barbers
  barbers_title: string;
  barbers_subtitle: string;

  // Testimonials
  testimonials_title: string;
  testimonials_subtitle: string;

  // Benefits
  benefits_title: string;
  benefits_subtitle: string;
  benefits_default: string[];

  // Final CTA
  final_cta_title: string;
  final_cta_subtitle: string;
  final_cta_button: string;

  // Footer
  footer_home: string;
  footer_book: string;
  footer_admin: string;

  // Booking - General
  booking_title: string;
  booking_step_of: string; // "Passo {step} de {total}"
  booking_step_labels: string[];

  // StepBarber
  step_barber_title: string;
  step_barber_any_title: string;
  step_barber_any_desc: string;

  // StepService / Multi
  step_service_title: string;
  step_service_multi_title: string;
  step_service_multi_subtitle: string;
  step_service_multi_summary: string;
  step_service_multi_deposit: string;
  step_service_multi_barber_filter: string;
  step_service_multi_select_min: string;
  step_service_multi_continue: string; // "Continuar com {n} serviço(s)"

  // StepDate
  step_date_title: string;
  step_date_days: string[];
  step_date_months: string[];

  // StepTime
  step_time_title: string;
  step_time_closed: string;
  step_time_not_configured: string;
  step_time_no_barber: string;
  step_time_no_barber_day: string;
  step_time_no_slots: string;
  step_time_no_slots_hint: string;
  step_time_try_another: string;

  // StepClientInfo
  step_client_title: string;
  step_client_subtitle: string;
  step_client_name_label: string;
  step_client_name_placeholder: string;
  step_client_whatsapp_label: string;
  step_client_whatsapp_placeholder: string;
  step_client_email_label: string;
  step_client_email_placeholder: string;
  step_client_birthdate_label: string;
  step_client_birthdate_placeholder: string;
  step_client_referral_label: string;
  step_client_referral_placeholder: string;
  step_client_continue: string;

  // Validation errors
  val_name_required: string;
  val_name_min: string;
  val_whatsapp_required: string;
  val_whatsapp_invalid: string;
  val_email_required: string;
  val_email_invalid: string;
  val_birthdate_required: string;
  val_birthdate_incomplete: string;
  val_birthdate_invalid_format: string;
  val_birthdate_invalid: string;
  val_birthdate_month: string;
  val_birthdate_day: string;
  val_birthdate_day_overflow: string;
  val_birthdate_year: string;
  val_birthdate_future: string;
  val_referral_required: string;

  // StepConfirm
  step_confirm_title: string;
  step_confirm_subtitle: string;
  step_confirm_service: string;
  step_confirm_services: string;
  step_confirm_total_time: string;
  step_confirm_barber: string;
  step_confirm_date: string;
  step_confirm_time: string;
  step_confirm_total: string;
  step_confirm_client: string;
  step_confirm_pix_title: string;
  step_confirm_pix_desc: string;
  step_confirm_pix_deposit_label: string;
  step_confirm_pix_copy: string;
  step_confirm_pix_copied: string;
  step_confirm_pix_checkbox: string;
  step_confirm_pix_not_configured_title: string;
  step_confirm_pix_not_configured_desc: string;
  step_confirm_button: string;
  step_confirm_loading: string;

  // BookingSuccess
  success_title: string;
  success_subtitle: string;
  success_whatsapp_hint: string;
  success_date_time: string;
  success_service: string;
  success_services: string;
  success_barber: string;
  success_code: string;
  success_total: string;
  success_whatsapp_button: string;
  success_whatsapp_not_configured: string;
  success_popup_blocked: string;
  success_popup_open: string;
  success_home_button: string;

  // Referral options
  referral_outros: string;

  // Language selector
  lang_label: string;

  // Misc
  min_unit: string; // "min"
}
