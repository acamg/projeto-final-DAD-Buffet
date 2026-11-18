'use strict';
const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const database = require('./database');
const mysqlService = require('./database-mysql-service');
const { ensureMySQLSchema } = require('./database-auto-init');
const dataPath = path.join(app.getPath('appData'), 'BuffetManager');
fs.mkdirSync(dataPath, { recursive: true });
app.setPath('userData', dataPath);
const sessionDir = path.join(dataPath, 'session');
fs.mkdirSync(sessionDir, { recursive: true });
app.setPath('sessionData', sessionDir);
function win() {
    const window = new BrowserWindow({ width: 1250, height: 820, minWidth: 900, minHeight: 650, title: 'Buffet Manager', backgroundColor: '#f5f7fb', webPreferences: { preload: path.join(__dirname, '../preload/preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true } });
    window.loadFile(path.join(__dirname, '../renderer/index.html'));
    window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
    window.webContents.on('will-navigate', e => e.preventDefault());
}
function register() {
    ipcMain.handle('definitions', () => mysqlService.definitions);
    ipcMain.handle('list', async (_e, t) => {
        try {
            return await mysqlService.list(t);
        } catch (err) {
            console.warn(`[IPC list:${t}] Falha no MySQL, usando SQLite: ${err.message}`);
            return database.list(t);
        }
    });
    ipcMain.handle('get', async (_e, t, id) => {
        try {
            return await mysqlService.get(t, id);
        } catch (err) {
            console.warn(`[IPC get:${t}] Falha no MySQL, usando SQLite: ${err.message}`);
            return database.get(t, id);
        }
    });
    ipcMain.handle('save', async (_e, t, data) => {
        try {
            return await mysqlService.save(t, data);
        } catch (err) {
            console.warn(`[IPC save:${t}] Falha no MySQL, usando SQLite: ${err.message}`);
            return database.save(t, data);
        }
    });
    ipcMain.handle('remove', async (_e, t, id) => {
        try {
            return await mysqlService.remove(t, id);
        } catch (err) {
            console.warn(`[IPC remove:${t}] Falha no MySQL, usando SQLite: ${err.message}`);
            return database.remove(t, id);
        }
    });
    ipcMain.handle('dashboard', async () => {
        try {
            return await mysqlService.dashboard();
        } catch (err) {
            console.warn(`[IPC dashboard] Falha no MySQL, usando SQLite: ${err.message}`);
            return database.dashboard();
        }
    });
    ipcMain.handle('quote-detail', async (_e, id) => {
        try {
            return await mysqlService.quoteDetail(id);
        } catch (err) {
            console.warn(`[IPC quoteDetail] Falha no MySQL, usando SQLite: ${err.message}`);
            return database.quoteDetail(id);
        }
    });
    ipcMain.handle('backup', async () => {
        const { canceled, filePath } = await dialog.showSaveDialog({ 
            title: 'Salvar backup do Buffet Manager', 
            defaultPath: 'buffet-backup.sql', 
            filters: [{ name: 'Script SQL / Backup', extensions: ['sql', 'sqlite'] }] 
        });
        if (canceled || !filePath) return null;
        if (filePath.endsWith('.sql')) {
            return await mysqlService.backup(filePath);
        }
        return database.backup(filePath);
    });
    ipcMain.handle('send-email', async (_e, payload) => {
        const { to, subject, body } = payload || {};
        if (typeof to !== 'string' || to.length > 250 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) throw Error('E-mail do cliente inválido');
        if (typeof subject !== 'string' || subject.length > 250 || typeof body !== 'string' || body.length > 7000) throw Error('Conteúdo de e-mail inválido');
        const uri = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        await shell.openExternal(uri); return true;
    });
    ipcMain.handle('weather', async (_e, location, date) => {
        if (typeof location !== 'string' || location.length > 120 || !/^[\w\sÀ-ÿ,.'-]+$/u.test(location)) throw Error('Informe a cidade do evento');
        if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw Error('Data inválida');
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const target = new Date(date + 'T12:00:00'); const diff = Math.ceil((target - today) / 86400000);
        if (!Number.isFinite(diff) || diff < 0 || diff > 15) return { unavailable: true, message: 'Previsão disponível apenas para os próximos 16 dias (incluindo hoje).' };
        const request = async url => { const res = await fetch(url, { signal: AbortSignal.timeout(9000) }); if (!res.ok) throw Error('Serviço de clima indisponível'); return res.json(); };
        const geo = await request(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=pt&format=json`);
        if (!geo.results?.length) throw Error('Cidade não encontrada na consulta climática');
        const place = geo.results[0];
        const data = await request(`https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code&timezone=auto&forecast_days=16`);
        const i = data.daily?.time?.indexOf(date);
        if (i < 0 || i === undefined) return { unavailable: true, message: 'Previsão ainda não disponível para esta data.' };
        return { cidade: `${place.name}, ${place.country}`, data: date, max: data.daily.temperature_2m_max[i], min: data.daily.temperature_2m_min[i], chuva: data.daily.precipitation_probability_max[i], codigo: data.daily.weather_code[i] };
    });
}
app.whenReady().then(() => {
    database.init(dataPath);
    ensureMySQLSchema().catch(err => console.warn('[Main] Aviso ao inicializar MySQL:', err.message));
    register();
    win();
    app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) win(); });
});
app.on('before-quit', () => database.close());
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
