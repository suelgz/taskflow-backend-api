# TASKFLOW — Proje Tanıtım Dokümanı

**Projenin amacı:** Node.js ve Express.js kullanarak bir yazılım ekibinin görevleri oluşturmasını, çalışanlara atamasını, öncelik ve durum yönetimini yapmasını sağlayan REST API geliştirmek.

**Senaryo:** Yazılım şirketinde proje yöneticisi ekip üyelerine görev atar. Görevler `pending`, `in-progress` ve `completed` durumlarıyla takip edilir. Öncelikler `low`, `medium`, `high` olabilir.

**Teknolojiler:** Node.js, Express.js, JSON, REST API, Middleware.

**Fonksiyonlar:** POST /tasks, GET /tasks, GET /tasks/:id, PUT /tasks/:id ve DELETE /tasks/:id. İsteklerin HTTP metodu, URL ve zamanı logger middleware ile konsola kaydedilir.

**Veri modeli:** id, title, description, assignee, project, priority, status, createdAt, updatedAt. Veri JSON dosyasında saklanır.

**Test:** 7 otomatik test geçmiştir. Postman koleksiyonundaki 5 CRUD testi ayrıca manuel olarak çalıştırılarak ekran görüntüleri alınmalıdır.

**Teslim:** Bu repoda kaynak kod, kurulum README dosyası, proje tanıtım PDF'i, Postman koleksiyonu ve ekran görüntüsü rehberi bulunmaktadır. Beş gerçek Postman ekran görüntüsü sonradan eklenecektir.
