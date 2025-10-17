export function handleLoginPageCallback(): void {
  const anuraResult = window.Anura.getAnura();
  const visitorId = anuraResult.getId();
  
  addVisitorIdToLoginForm(visitorId);
}

export function addVisitorIdToLoginForm(visitorId: string): void {
  const loginForm = document.getElementById('loginform');
  if (!loginForm) {
    return;
  }
  
  const existing = loginForm.querySelector('input[name="anura_visitor_id"]');
  if (existing) {
    existing.remove();
  }
  
  // Add hidden field with visitor ID
  const hiddenField = document.createElement('input');
  hiddenField.type = 'hidden';
  hiddenField.name = 'anura_visitor_id';
  hiddenField.value = visitorId;
  
  loginForm.appendChild(hiddenField);
}
