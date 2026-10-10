# TaskFlow — Görev ve Proje Yönetim Sistemi API

Node.js ve Express.js kullanılarak geliştirilmiş bir **REST API bitirme projesi**. Görevler oluşturulabilir, listelenebilir, görüntülenebilir, güncellenebilir ve silinebilir (CRUD). İstekler logger middleware tarafından kaydedilir. Veriler yerel `data/tasks.json` dosyasında saklanır.

## Kurulum

Node.js 18+ gereklidir.

```bash
git clone https://github.com/suelgz/taskflow-backend-api.git
cd taskflow-backend-api
npm install
npm start
```

Sunucu: `http://localhost:3000`

Otomatik testler: `npm test` (7 test). Geliştirme modu: `npm run dev`.

## API endpoint'leri

| Method | Endpoint | Açıklama |
|---|---|---|
| POST | `/tasks` | Görev oluştur (201) |
| GET | `/tasks` | Görevleri listele (200) |
| GET | `/tasks/:id` | Görev detayı (200) |
| PUT | `/tasks/:id` | Görev güncelle (200) |
| DELETE | `/tasks/:id` | Görev sil (200) |

Örnek POST body:

```json
{
  "title": "Login API geliştir",
  "description": "Kullanıcı giriş endpointi",
  "assignee": "Su",
  "project": "NovaStore",
  "priority": "high",
  "status": "pending"
}
```

Görev alanları: `id` (UUID), `title`, `description`, `assignee`, `project`, `priority` (`low`, `medium`, `high`), `status` (`pending`, `in-progress`, `completed`), `createdAt`, `updatedAt`.

## Postman

`postman/TaskFlow.postman_collection.json` dosyasını Postman'e import edin. `npm start` ile API'yi başlatın; 01–05 isteklerini sırayla çalıştırın. POST isteği `taskId` değerini otomatik kaydeder.

**Teslim için:** Postman'de başarılı 5 CRUD isteğinin *gerçek* ekran görüntülerini `postman/screenshots/` içine ekleyin. Henüz bu ekran görüntüleri mevcut değildir.

## Proje yapısı

- `src/app.js` — Express kurulumu ve middleware
- `src/server.js` — HTTP sunucusu
- `src/routes/taskRoutes.js` — routing
- `src/controllers/taskController.js` — görev CRUD
- `src/middleware/logger.js` — istek logger'ı
- `src/data/taskStore.js` — JSON dosyası işlemleri
- `data/tasks.json` — başlangıç verileri
- `tests/task.test.js` — 7 otomatik test
- `postman/` — CRUD Postman koleksiyonu ve ekran görüntüsü rehberi
- `docs/` — proje tanıtım PDF'i, API tasarımı, test özeti

Yönergedeki zorunlu Node.js, Express, REST API, CRUD, routing ve logger kapsamı uygulanmıştır. Gelişmiş filtreleme ve raporlama isteğe bağlı olduğundan eklenmemiştir.
