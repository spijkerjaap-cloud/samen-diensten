export const defaultTypes = [
    { id: 'early', name: 'Vroege dienst', code: 'V', icon: '☀️', color: '#7EC5A2', start: '07:00', end: '15:30', breakMinutes: 30, kind: 'work' },
    { id: 'late', name: 'Late dienst', code: 'L', icon: '🌅', color: '#83B7E8', start: '15:00', end: '23:30', breakMinutes: 30, kind: 'work' },
    { id: 'night', name: 'Nachtdienst', code: 'N', icon: '🌙', color: '#B69CDE', start: '23:00', end: '07:30', breakMinutes: 30, kind: 'work' },
    { id: 'oncall', name: 'Bereikbaar', code: 'B', icon: '📞', color: '#EDBB7E', start: '17:00', end: '08:00', breakMinutes: 0, kind: 'oncall' },
    { id: 'off', name: 'Vrij', code: '–', icon: '🌿', color: '#BCC8A6', start: '00:00', end: '00:00', breakMinutes: 0, kind: 'off' },
    { id: 'holiday', name: 'Vakantie', code: 'VA', icon: '🏖️', color: '#E8A6B6', start: '00:00', end: '00:00', breakMinutes: 0, kind: 'off' },
];
export const initialState = { version: 1, types: defaultTypes, shifts: [], settings: { theme: 'system', weekNumbers: true, showTimes: true, showHours: true, weekStartsOn: 1, contractHours: 36 } };
export const dateKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const fromKey = (s) => new Date(s + 'T12:00:00');
export const validDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(+fromKey(s)) && dateKey(fromKey(s)) === s;
export const addDays = (s, n) => { const d = fromKey(s); d.setDate(d.getDate() + n); return dateKey(d); };
export const validTime = (s) => /^([01]\d|2[0-3]):[0-5]\d$/.test(s);
export const duration = (t) => { if (t.kind === 'off')
    return 0; const min = (s) => +s.slice(0, 2) * 60 + (+s.slice(3)); const a = min(t.start), b = min(t.end); return Math.max(0, (b < a ? b + 1440 : b) - a - t.breakMinutes) / 60; };
export function typeError(t) { if (!t.name.trim())
    return 'Geef je dienst een naam.'; if (!t.code.trim())
    return 'Vul een afkorting in.'; if (!validTime(t.start) || !validTime(t.end))
    return 'Gebruik tijden als 07:00 of 23:30.'; if (!Number.isFinite(t.breakMinutes) || t.breakMinutes < 0 || t.breakMinutes > 1440)
    return 'Vul een geldige pauze in.'; if (t.kind !== 'off' && t.start === t.end)
    return 'Kies verschillende begin- en eindtijden.'; const raw = { ...t, breakMinutes: 0 }; if (t.kind !== 'off' && t.breakMinutes >= duration(raw) * 60)
    return 'De pauze moet korter zijn dan de dienst.'; if (!/^#[0-9a-fA-F]{6}$/.test(t.color))
    return 'Kies een geldige kleur.'; return null; }
export function monthDays(date, firstDay) { const d = fromKey(date); d.setDate(1); d.setDate(1 - ((d.getDay() - firstDay + 7) % 7)); return Array.from({ length: 42 }, (_, i) => addDays(dateKey(d), i)); }
export function weekDays(date, firstDay) { const d = fromKey(date); return Array.from({ length: 7 }, (_, i) => addDays(date, i - ((d.getDay() - firstDay + 7) % 7))); }
export function weekNumber(s) { const d = fromKey(s); const utc = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); utc.setUTCDate(utc.getUTCDate() + 4 - (utc.getUTCDay() || 7)); const y = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1)); return Math.ceil((((+utc - +y) / 86400000) + 1) / 7); }
export function addShifts(state, dates, typeId, id, note = '') { return { ...state, shifts: [...state.shifts, ...[...new Set(dates)].filter(date => !state.shifts.some(s => s.date === date && s.typeId === typeId)).map(date => ({ id: id(), date, typeId, note }))] }; }
export function repeatPattern(state, start, end, pattern, id) { if (!validDate(start) || !validDate(end) || end < start)
    throw Error('Controleer de begin- en einddatum.'); if (!pattern.length || pattern.some(t => !state.types.some(v => v.id === t)))
    throw Error('Kies een geldig patroon.'); const days = []; for (let d = start; d <= end; d = addDays(d, 1)) {
    days.push(d);
    if (days.length > 731)
        throw Error('Kies een periode van maximaal twee jaar.');
} let next = state; days.forEach((d, i) => { if (!state.shifts.some(s => s.date === d))
    next = addShifts(next, [d], pattern[i % pattern.length], id); }); return next; }
export function copyWeek(state, source, target, firstDay, id) { const sourceDays = weekDays(source, firstDay), targetDays = weekDays(target, firstDay); if (sourceDays[0] === targetDays[0])
    throw Error('Kies een andere doelweek.'); let next = state; sourceDays.forEach((date, i) => { if (!state.shifts.some(s => s.date === targetDays[i]))
    state.shifts.filter(s => s.date === date).forEach(s => { next = addShifts(next, [targetDays[i]], s.typeId, id, s.note); }); }); return next; }
export function parseBackup(input) { const v = JSON.parse(input); if (v.version !== 1 || !Array.isArray(v.types) || v.types.length === 0 || v.types.length > 100 || !Array.isArray(v.shifts) || v.shifts.length > 30000)
    throw Error('Dit is geen geldige Samen-back-up.'); for (const t of v.types) {
    if (typeof t.id !== 'string' || typeof t.name !== 'string' || typeof t.code !== 'string' || typeof t.icon !== 'string' || typeof t.start !== 'string' || typeof t.end !== 'string' || !['work', 'off', 'oncall'].includes(t.kind) || typeError(t))
        throw Error('Een diensttype in de back-up is ongeldig.');
} ; if (new Set(v.types.map(t => t.id)).size !== v.types.length || new Set(v.shifts.map(s => s.id)).size !== v.shifts.length)
    throw Error('De back-up bevat dubbele identificaties.'); for (const s of v.shifts) {
    if (typeof s.id !== 'string' || typeof s.date !== 'string' || !validDate(s.date) || typeof s.note !== 'string' || !v.types.some(t => t.id === s.typeId))
        throw Error('De back-up bevat een ongeldige dienst.');
} const p = v.settings; if (!p || !['system', 'light', 'dark'].includes(p.theme) || typeof p.weekNumbers !== 'boolean' || typeof p.showTimes !== 'boolean' || typeof p.showHours !== 'boolean' || ![0, 1].includes(p.weekStartsOn) || !Number.isFinite(p.contractHours) || p.contractHours < 0 || p.contractHours > 168)
    throw Error('De instellingen zijn ongeldig.'); return v; }
export function toICS(state, now = new Date()) { const escape = (s) => s.replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,'); const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Samen//Diensten//NL', 'CALSCALE:GREGORIAN', 'X-WR-CALNAME:Mijn diensten', 'BEGIN:VTIMEZONE', 'TZID:Europe/Amsterdam', 'BEGIN:DAYLIGHT', 'DTSTART:19700329T020000', 'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU', 'TZOFFSETFROM:+0100', 'TZOFFSETTO:+0200', 'END:DAYLIGHT', 'BEGIN:STANDARD', 'DTSTART:19701025T030000', 'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU', 'TZOFFSETFROM:+0200', 'TZOFFSETTO:+0100', 'END:STANDARD', 'END:VTIMEZONE']; for (const s of state.shifts) {
    const t = state.types.find(t => t.id === s.typeId);
    if (t.kind === 'off')
        continue;
    lines.push('BEGIN:VEVENT', `UID:${s.id}@samen-app`, `DTSTAMP:${now.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`, `DTSTART;TZID=Europe/Amsterdam:${s.date.replace(/-/g, '')}T${t.start.replace(':', '')}00`, `DTEND;TZID=Europe/Amsterdam:${(t.end < t.start ? addDays(s.date, 1) : s.date).replace(/-/g, '')}T${t.end.replace(':', '')}00`, `SUMMARY:${escape(t.name)}`, `DESCRIPTION:${escape(s.note)}`, 'END:VEVENT');
} lines.push('END:VCALENDAR'); return lines.map(line => { let text = '', len = 0; for (const c of line) {
    const n = new TextEncoder().encode(c).length;
    if (len + n > 73) {
        text += '\r\n ';
        len = 1;
    }
    text += c;
    len += n;
} return text; }).join('\r\n') + '\r\n'; }
