export function authSendError(error: unknown): string {
  const details = typeof error === "object" && error !== null ? error as { code?: string; status?: number } : {};
  if (details.code === "over_email_send_rate_limit") {
    return "A belépőlevél most nem küldhető el: elfogyott a szolgáltató levélküldési kerete. Az alap levelező óránként legfeljebb 2 levelet küld az egész projekthez. Várj a keret felszabadulásáig, akár egy órát, és utána csak egyszer kérj új linket. A sűrű újrapróbálkozás nem segít.";
  }
  if (details.status === 429 || details.code === "over_request_rate_limit") {
    return "Túl sok belépési kérés érkezett. Várj a szolgáltató korlátozásának feloldásáig, majd egyszer próbáld újra. A pontos várakozási időt a szolgáltató nem adta meg.";
  }
  if (details.code === "email_address_not_authorized") {
    return "Erre az e-mail-címre a jelenlegi levelező nem küldhet belépőlinket. A projekt tulajdonosának saját SMTP-szolgáltatót kell beállítania.";
  }
  return "Nem sikerült belépőlinket küldeni. Ellenőrizd a kapcsolatot és az e-mail-címet. Ha a hiba megmarad, a szolgáltató belépési naplója segít azonosítani az okát.";
}
