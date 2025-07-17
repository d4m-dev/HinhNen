console.log('Script main.js đã chạy!');

const token = "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";
const owner = "d4m-dev";
const repo = "HinhNenDep";
const folder = "images";

const container = document.getElementById('image-container');
container.textContent = 'Đang tải ảnh...';

fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${folder}`, {
  headers: {
    Authorization: `token ${token}`
  }
})
  .then(res => res.json())
  .then(data => {
    console.log('Dữ liệu ảnh từ GitHub:', data);
    container.innerHTML = '';
    data
      .filter(item => item.type === 'file')
      .forEach(img => {
        const card = document.createElement('div');
        card.className = 'img-card';
        card.innerHTML = `
          <img src="${img.download_url}" alt="${img.name}" loading="lazy" />
          <div class="img-name">${img.name}</div>
          <a href="${img.download_url}" download>⬇️ Tải về</a>
        `;
        container.appendChild(card);
      });
    if (container.innerHTML === '') container.textContent = 'Không có ảnh nào!';
  })
  .catch((err) => {
    console.error('Lỗi khi fetch ảnh:', err);
    container.textContent = 'Lỗi khi tải ảnh!';
  });