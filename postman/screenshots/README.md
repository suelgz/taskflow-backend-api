# Test kanıtları

GitHub Actions tarafından otomatik olarak gerçek HTTP istekleriyle Postman koleksiyonu Newman üzerinden test edilir. Beş CRUD isteğinin sonucu `postman/results/newman-results.json` ve `postman/results/summary.json` içinde saklanır.

Oluşturulan görüntüler: `01-create.png`, `02-list.png`, `03-detail.png`, `04-update.png`, `05-delete.png`.

**Önemli:** Bunlar gerçek Newman test sonuçlarının Chromium ile alınmış rapor ekran görüntüleridir; **Postman masaüstü arayüzünden doğrudan alınmış görüntüler değildir**. Eğitmen Postman UI görüntülerini şart koşuyorsa, uygulamada aynı istekleri manuel çalıştırıp ayrıca çekmek gerekir.

Oluşturma kaynağı: `scripts/render-test-evidence.py`. Workflow: `.github/workflows/postman-tests.yml`.
