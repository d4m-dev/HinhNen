import './style.css';

// Hiệu ứng hoa rơi
function createPetal() {
  const petal = document.createElement('div');
  petal.className = 'petal';
  petal.style.left = Math.random() * window.innerWidth + 'px';
  petal.style.animationDuration = (5 + Math.random() * 3) + 's';
  document.body.appendChild(petal);
  setTimeout(() => petal.remove(), 7000);
}
setInterval(createPetal, 600);

// Phân trang
const PAGE_SIZE = 12;
let images = [];
let currentPage = 1;

function renderImages() {
  const container = document.getElementById("image-container");
  container.innerHTML = "";
  const start = (currentPage - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  images.slice(start, end).forEach((img, idx) => {
    const card = document.createElement("div");
    card.className = "img-card";
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", img.name);

    const image = document.createElement("img");
    image.src = img.url;
    image.alt = img.name;
    image.loading = "lazy";
    image.style.opacity = "0";
    image.onload = () => {
      image.style.opacity = "1";
    };

    const caption = document.createElement("div");
    caption.className = "img-name";
    caption.textContent = img.name;

    card.appendChild(image);
    card.appendChild(caption);

    card.onclick = () => openModal(img);
    card.onkeypress = (e) => { if (e.key === "Enter") openModal(img); };

    container.appendChild(card);
  });
  renderPagination();
}

function renderPagination() {
  const pag = document.getElementById("pagination");
  pag.innerHTML = "";
  const totalPages = Math.ceil(images.length / PAGE_SIZE);
  if (totalPages <= 1) return;

  const prevBtn = document.createElement("button");
  prevBtn.textContent = "← Trước";
  prevBtn.disabled = currentPage === 1;
  prevBtn.onclick = () => { currentPage--; renderImages(); };
  pag.appendChild(prevBtn);

  for (let i = 1; i <= totalPages; i++) {
    if (i === currentPage || i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) {
      const btn = document.createElement("button");
      btn.textContent = i;
      btn.disabled = i === currentPage;
      btn.onclick = () => { currentPage = i; renderImages(); };
      pag.appendChild(btn);
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      const dots = document.createElement("span");
      dots.textContent = "...";
      pag.appendChild(dots);
    }
  }

  const nextBtn = document.createElement("button");
  nextBtn.textContent = "Sau →";
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.onclick = () => { currentPage++; renderImages(); };
  pag.appendChild(nextBtn);
}

// Modal
function openModal(img) {
  document.getElementById("modal-img").src = img.url;
  document.getElementById("modal-img").alt = img.name;
  document.getElementById("modal-name").textContent = img.name;

  // Tải về trực tiếp
  document.getElementById("download-btn").onclick = function(e) {
    e.preventDefault();
    fetch(img.url)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = img.name;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      });
  };

  document.getElementById("share-btn").onclick = () => shareImage(img);
  document.getElementById("modal").style.display = "flex";
  document.body.style.overflow = "hidden";
}
function closeModal() {
  document.getElementById("modal").style.display = "none";
  document.body.style.overflow = "";
}
document.getElementById("modal-close").onclick = closeModal;
document.getElementById("modal").onclick = function(e) {
  if (e.target === this) closeModal();
};

// Chia sẻ
function shareImage(img) {
  if (navigator.share) {
    navigator.share({
      title: img.name,
      text: "Xem hình này!",
      url: img.url
    });
  } else {
    navigator.clipboard.writeText(img.url);
    alert("Đã sao chép link ảnh vào clipboard!");
  }
}

// AJAX lấy ảnh từ GitHub
const token = import.meta.env.VITE_GITHUB_TOKEN;
const owner = import.meta.env.VITE_GITHUB_OWNER;
const repo = import.meta.env.VITE_GITHUB_REPO;
const folder = import.meta.env.VITE_GITHUB_FOLDER;

fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${folder}`, {
  headers: {
    Authorization: `token ${token}`
  }
})
  .then(res => res.json())
  .then(data => {
    images = data
      .filter(item => item.type === 'file')
      .map(item => ({
        name: item.name,
        url: item.download_url
      }));
    currentPage = 1;
    renderImages();
  })
  .catch(err => {
    document.getElementById("image-container").textContent = "Lỗi khi tải ảnh.";
    console.error(err);
  });