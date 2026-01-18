import emailjs from "@emailjs/browser";

// --- COLOQUE SUAS CREDENCIAIS AQUI ---
const SERVICE_ID = "service_msxzrjb";
const TEMPLATE_ID = "template_nwmqlek";
const PUBLIC_KEY = "ivg7dAyix6zmQIg_C";
// ------------------------------------

const EmailService = {
  /**
   * Envia um email de lembrete de agendamento usando EmailJS.
   * @param {object} agendamento - O objeto de agendamento do nosso backend.
   * @returns {Promise} - Retorna a promessa da API do emailjs.
   */
  sendReminder: (agendamento) => {
    // 1. Verifica se o paciente tem email
    if (!agendamento?.paciente?.email) {
      console.warn("Agendamento sem email do paciente. Notificação pulada.");
      return Promise.resolve({ text: "Paciente sem email." });
    }

    // 2. Prepara as variáveis EXATAMENTE como no template do EmailJS
    const templateParams = {
      nome_paciente: agendamento.paciente.nome,
      email_paciente: agendamento.paciente.email, // Importante: para quem será enviado
      data_consulta: new Date(agendamento.data).toLocaleDateString("pt-BR"),
      hora_consulta: agendamento.hora,
      nome_medico: agendamento.medico?.nome || "Clínico Geral",
    };

    console.log(
      "Preparando para enviar email com os parâmetros:",
      templateParams,
    );

    // 3. Dispara o envio
    // O EmailJS usa o campo 'to_email' ou 'email_paciente' do templateParams para saber o destinatário.
    // Garanta que seu template tenha um campo oculto ou uma configuração para isso.
    // Se o email de destino estiver no próprio template, o 'to_email' não é necessário aqui.
    return emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
  },
};

export default EmailService;
