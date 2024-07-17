// script.js dosyası

async function fetchAndShowContent(category) {
    try {
        const response = await fetch(`http://localhost:3000/edebiDonemler/${category}`);
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.json();
        var contentDiv = document.getElementById("content");
        var content = "<ul class='content-list'>";

        data.forEach(item => {
            var eserler = item.eserler;
            content += `<li class='content-item'><strong>${item.yazar}</strong>: `;
            eserler.forEach(eser => {
                content += `${eser.eser} - `;
            });
            content = content.slice(0, -3);  
            content += "</li>";
        });

        content += "</ul>";
        contentDiv.innerHTML = content;
        animateContent();
    } catch (error) {
        console.error('Hata:', error);
    }
}

function showDetail(title, author, summary, topic, birthDate, birthPlace, imageUrl) {
    var detailDiv = document.getElementById("content");
    var detailContent = `
        <div class="detail">
            <h2>${title}</h2>
            ${author ? `<p><strong>Yazar:</strong> ${author}</p>` : ''}
            ${summary ? `<p><strong>Özet:</strong> ${summary}</p>` : ''}
            ${topic ? `<p><strong>Konu:</strong> ${topic}</p>` : ''}
            ${birthDate ? `<p><strong>Doğum Tarihi:</strong> ${birthDate}</p>` : ''}
            ${birthPlace ? `<p><strong>Doğum Yeri:</strong> ${birthPlace}</p>` : ''}
            ${imageUrl ? `<img src="${imageUrl}" alt="${title}">` : ''}
            <button onclick="closeDetail()">Kapat</button>
        </div>
    `;
    detailDiv.innerHTML = detailContent;
    animateDetail();
}

function getImageUrl(title) {
    const images = {
        'Benim Adım Kırmızı': 'Resimler/kitap1.jpeg',
        'Aşk': 'Resimler/ask.jpg',
        'İnce Memed': 'Resimler/ince_memed.jpg',
        'İstanbul Hatırası': 'Resimler/istanbul_hatirasi.jpg',
        'Kuyucaklı Yusuf': 'Resimler/kuyucakli_yusuf.jpg'
    };
    return images[title] || '';
}

function closeDetail() {
    document.getElementById("content").innerHTML = '';
}

function animateContent() {
    var items = document.querySelectorAll('.content-item');
    items.forEach((item, index) => {
        setTimeout(() => {
            item.classList.add('visible');
        }, index * 100);
    });
}

function animateDetail() {
    var detail = document.querySelector('.detail');
    detail.classList.add('visible');
}
