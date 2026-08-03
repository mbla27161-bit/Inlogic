/**
 * InLogic site config
 *
 * EmailJS (работает на GitHub Pages без backend):
 * 1. Зарегистрируйтесь на https://www.emailjs.com
 * 2. Добавьте Email Service (Gmail / Outlook / свой SMTP)
 * 3. Создайте шаблон письма с переменными:
 *    {{name}} {{phone}} {{from}} {{to}} {{type}} {{weight}} {{message}} {{page}} {{sentAt}}
 * 4. Account → API Keys → Public Key
 * 5. Подставьте значения ниже
 *
 * В письме придёт полный телефон вида +375291234567
 */
window.INLOGIC_EMAILJS = window.INLOGIC_EMAILJS || {
  publicKey: '',   // Public Key из EmailJS
  serviceId: '',   // Service ID, например service_xxxxxxx
  templateId: ''   // Template ID, например template_xxxxxxx
};

/** @deprecated Используйте INLOGIC_EMAILJS */
window.INLOGIC_FORM_ENDPOINT = window.INLOGIC_FORM_ENDPOINT || '';
