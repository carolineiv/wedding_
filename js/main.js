class ProtocolInvitation {
    constructor() {
        this.guests = [];
        this.music = document.getElementById('protocolMusic');
        this.isMusicPlaying = false;
        
        this.init();
        this.setupGuestForm();
        this.setupProgramList();
    }
    
    init() {
        this.loadGuestsFromStorage();
        this.renderGuestList();
        this.setupPhotoAnimation();
        
        // Устанавливаем имена для подписей
        this.setupSignatures();
    }
    
    setupGuestForm() {
        const addBtn = document.getElementById('addGuestBtn');
        const guestInput = document.getElementById('guestName');
        const playMusicBtn = document.getElementById('playMusicBtn');
        
        if (addBtn) {
            addBtn.addEventListener('click', () => this.addGuest());
        }
        
        if (guestInput) {
            guestInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.addGuest();
            });
        }
        
        if (playMusicBtn) {
            playMusicBtn.addEventListener('click', () => this.toggleMusic());
        }
        
        window.addEventListener('beforeunload', () => {
            localStorage.setItem('protocolGuests', JSON.stringify(this.guests));
        });
    }
    
    setupProgramList() {
        const programContainer = document.getElementById('programList');
        if (programContainer) {
            const programItems = [
                '18:00 — Сбор понятых (сбор гостей)',
                '18:30 — Оглашение протокола задержания (торжественная часть)',
                '19:00 — Подписание пожизненного контракта (церемония)',
                '19:30 — Фотофиксация',
                '20:00 — Праздничное застолье',
                '22:00 — Танцевальные мероприятия',
                '00:00 — Закрытие дела'
            ];
            
            programContainer.innerHTML = programItems.map(item => `<div class="program-item">${item}</div>`).join('');
        }
    }
    
    setupSignatures() {
        const groomSurname = document.getElementById('groomSurname');
        const groomName = document.getElementById('groomName');
        const groomPatronymic = document.getElementById('groomPatronymic');
        const signGroom = document.getElementById('signGroom');
        const brideFullName = document.getElementById('brideFullName');
        const signBride = document.getElementById('signBride');
        
        // Здесь можно задать реальные имена
        const groom = {
            surname: 'КАБЕЛЬ',
            name: 'ИМЯ',
            patronymic: 'ОТЧЕСТВО'
        };
        
        const bride = {
            fullName: 'ФАМИЛИЯ ИМЯ ОТЧЕСТВО'
        };
        
        if (groomSurname) groomSurname.textContent = groom.surname;
        if (groomName) groomName.textContent = groom.name;
        if (groomPatronymic) groomPatronymic.textContent = groom.patronymic;
        if (signGroom) signGroom.textContent = `${groom.surname} ${groom.name.charAt(0)}.${groom.patronymic.charAt(0)}.`;
        if (brideFullName) brideFullName.textContent = bride.fullName;
        if (signBride) signBride.textContent = bride.fullName.split(' ')[0] + ' ' + 
            bride.fullName.split(' ')[1]?.charAt(0) + '.' + 
            bride.fullName.split(' ')[2]?.charAt(0) + '.';
    }
    
    addGuest() {
        const input = document.getElementById('guestName');
        if (!input) return;
        
        let fullName = input.value.trim().toUpperCase();
        
        if (!fullName) {
            alert('Заполните ФИО задерживаемого гостя!');
            return;
        }
        
        if (!this.validateName(fullName)) {
            alert('Ошибка: ФИО должно содержать минимум 3 слова (Фамилия Имя Отчество)');
            return;
        }
        
        const guest = {
            id: Date.now(),
            name: fullName,
            date: new Date().toLocaleString('ru-RU')
        };
        
        this.guests.push(guest);
        this.renderGuestList();
        
        input.value = '';
        input.focus();
        
        if (!this.isMusicPlaying) {
            this.playBeep();
        }
    }
    
    validateName(name) {
        const parts = name.split(/\s+/);
        return parts.length >= 3 && parts.every(p => p.length > 1);
    }
    
    renderGuestList() {
        const container = document.getElementById('guestListDisplay');
        
        if (!container) return;
        
        if (this.guests.length === 0) {
            container.innerHTML = '<div class="guest-item" style="color: #999;">Нет задержанных. Заполните данные.</div>';
        } else {
            container.innerHTML = this.guests.map(guest => `
                <div class="guest-item" data-id="${guest.id}">
                    <strong>${guest.name}</strong><br>
                    <small>Время задержания: ${guest.date}</small>
                    <button class="remove-guest protocol-btn" style="margin-left: 10px; padding: 2px 8px;">✖</button>
                </div>
            `).join('');
            
            document.querySelectorAll('.remove-guest').forEach((btn, index) => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.removeGuest(this.guests[index].id);
                });
            });
        }
    }
    
    removeGuest(id) {
        this.guests = this.guests.filter(g => g.id !== id);
        this.renderGuestList();
        localStorage.setItem('protocolGuests', JSON.stringify(this.guests));
    }
    
    loadGuestsFromStorage() {
        const stored = localStorage.getItem('protocolGuests');
        if (stored) {
            try {
                this.guests = JSON.parse(stored);
            } catch(e) {
                this.guests = [];
            }
        }
    }
    
    toggleMusic() {
        const btn = document.getElementById('playMusicBtn');
        if (!this.music) return;
        
        if (this.isMusicPlaying) {
            this.music.pause();
            if (btn) btn.textContent = '♪ Включить саундтрек задержания';
            if (btn) btn.style.background = 'none';
        } else {
            this.music.play().catch(e => {
                alert('Нажмите на кнопку для воспроизведения музыки');
            });
            if (btn) btn.textContent = '■ Выключить саундтрек';
            if (btn) btn.style.background = '#2c2c2c';
            if (btn) btn.style.color = 'white';
        }
        
        this.isMusicPlaying = !this.isMusicPlaying;
    }
    
    playBeep() {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            oscillator.frequency.value = 880;
            gainNode.gain.value = 0.15;
            
            oscillator.start();
            gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.3);
            oscillator.stop(audioCtx.currentTime + 0.3);
            
            audioCtx.resume();
        } catch(e) {
            console.log('Web Audio API не поддерживается');
        }
    }
    
    setupPhotoAnimation() {
        const photos = document.querySelectorAll('.photo-frame');
        photos.forEach((photo, index) => {
            photo.style.opacity = '0';
            photo.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                photo.style.transition = 'all 0.6s ease-out';
                photo.style.opacity = '1';
                photo.style.transform = 'translateY(0)';
            }, 200 + index * 150);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ProtocolInvitation();
    
    const style = document.createElement('style');
    style.textContent = `
        .remove-guest {
            font-size: 12px;
            background: #8b0000 !important;
            color: white !important;
        }
        
        .remove-guest:hover {
            background: #5a0000 !important;
        }
        
        .program-item {
            padding: 5px 0;
            border-bottom: 1px dotted #ccc;
        }
    `;
    document.head.appendChild(style);
});