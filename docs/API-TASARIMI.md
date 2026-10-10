# TaskFlow — API ve veri modeli tasarımı

**Senaryo:** Bir yazılım ekibi projelerine ait görevleri çalışanlara atayıp güncel durumlarını izlemek ister. TaskFlow temel REST API sunar.

**Mimari:** `Postman → Express logger → Task routes → Task controller → data/tasks.json → JSON response`.

**Veri modeli:** `id` (UUID), `title`, `description`, `assignee`, `project`, `priority` (low/medium/high), `status` (pending/in-progress/completed), `createdAt`, `updatedAt`.

| Method | Endpoint | İşlem | Başarı |
|---|---|---|---|
| POST | `/tasks` | Görev oluştur | 201 |
| GET | `/tasks` | Görevleri listele | 200 |
| GET | `/tasks/:id` | Detay getir | 200 |
| PUT | `/tasks/:id` | Güncelle | 200 |
| DELETE | `/tasks/:id` | Sil | 200 |

**Hatalar:** Geçersiz veri 400, bulunamayan kayıt/endpoint 404, sunucu hatası 500.

**Logger:** Zaman damgası + HTTP metodu + endpoint konsola kaydedilir. Veri basit JSON dosyasında tutulur.
