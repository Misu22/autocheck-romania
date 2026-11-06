const vinInput = document.getElementById('vin');
const photoInput = document.getElementById('photo');
const scanStatus = document.getElementById('scan');
const preview = document.getElementById('preview');
const result = document.getElementById('result');

function cleanVin(value) {
  return value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '').slice(0, 17);
}
vinInput.addEventListener('input', () => {
  const pos = vinInput.selectionStart;
  vinInput.value = cleanVin(vinInput.value);
  try { vinInput.setSelectionRange(pos, pos); } catch {}
});

photoInput.addEventListener('change', async () => {
  const file = photoInput.files && photoInput.files[0];
  if (!file) return;
  preview.src = URL.createObjectURL(file);
  preview.hidden = false;
  scanStatus.textContent = 'Citesc fotografia. Poate dura câteva secunde…';
  try {
    if (!window.Tesseract) throw new Error('Biblioteca de citire nu s-a încărcat. Verifică internetul și încearcă din nou.');
    const worker = await Tesseract.createWorker('eng');
    const { data } = await worker.recognize(file);
    await worker.terminate();
    const candidates = (data.text.toUpperCase().match(/[A-HJ-NPR-Z0-9\s-]{11,24}/g) || [])
      .map(s => cleanVin(s)).filter(s => s.length === 17);
    const found = candidates.sort((a,b) => b.length-a.length)[0];
    if (found) {
      vinInput.value = found;
      scanStatus.textContent = 'Am găsit o posibilă serie VIN. Verific-o atent în câmp înainte să apeși „Verifică”.';
    } else {
      scanStatus.textContent = 'Nu am putut identifica sigur o serie de 17 caractere. Încearcă o fotografie mai clară sau introdu seria manual.';
    }
  } catch (err) {
    scanStatus.textContent = 'Citirea fotografiei nu a reușit: ' + err.message;
  }
});

document.getElementById('check').addEventListener('click', async () => {
  const vin = cleanVin(vinInput.value);
  vinInput.value = vin;
  if (vin.length !== 17 || /[IOQ]/.test(vin)) {
    result.innerHTML = '<div class="result-icon">⚠️</div><div><strong>Seria VIN nu pare validă</strong><p>VIN-ul trebuie să aibă 17 caractere și nu poate conține literele I, O sau Q. Verifică seria și încearcă din nou.</p></div>';
    return;
  }
  result.innerHTML = '<div class="result-icon">⏳</div><div><strong>Se încearcă decodificarea VIN…</strong><p>Interogăm o sursă publică de date tehnice. Aceasta nu este o verificare completă a daunelor sau kilometrajului.</p></div>';
  try {
    const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${encodeURIComponent(vin)}?format=json`);
    if (!response.ok) throw new Error('Sursa publică nu răspunde momentan.');
    const json = await response.json();
    const d = json.Results && json.Results[0];
    if (!d) throw new Error('Nu au fost returnate date.');
    const fields = [
      ['Marcă', d.Make], ['Model', d.Model], ['An', d.ModelYear],
      ['Tip caroserie', d.BodyClass], ['Motor', d.EngineModel],
      ['Țara de fabricație', d.PlantCountry]
    ].filter(([k,v]) => v && v !== 'Not Applicable' && v !== '0');
    const rows = fields.length
      ? fields.map(([k,v]) => `<p><b>${escapeHtml(k)}:</b> ${escapeHtml(v)}</p>`).join('')
      : '<p>Sursa nu a returnat suficiente date tehnice pentru acest VIN.</p>';
    result.innerHTML = `<div class="result-icon">✓</div><div><strong>Rezultat pentru ${escapeHtml(vin)}</strong>${rows}<p><b>Limită:</b> această sursă nu confirmă daune, kilometraj sau istoricul complet de înmatriculare. Datele sunt orientate în principal spre piața SUA.</p></div>`;
  } catch (err) {
    result.innerHTML = `<div class="result-icon">ⓘ</div><div><strong>Nu am putut obține datele acum</strong><p>${escapeHtml(err.message)} Seria a trecut verificarea de format, dar asta nu confirmă istoricul mașinii.</p></div>`;
  }
});

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
