const formSiswa = document.getElementById("form-siswa");
const inputId = document.getElementById("id-siswa");
const inputNama = document.getElementById("nama-siswa");
const inputKelas = document.getElementById("kelas-siswa");
const inputCari = document.getElementById("cari-siswa");
const daftarSiswa = document.getElementById("daftar-siswa");
const totalSiswa = document.getElementById("total-siswa");
const jumlahSiswa = document.getElementById("jumlah-siswa");
const tombolSimpan = document.getElementById("tombol-simpan");
const tombolBatal = document.getElementById("batal-edit");

let siswa = [];

try {
  const dataTersimpan = JSON.parse(
    localStorage.getItem("bayarKasSiswa") || "[]"
  );

  if (Array.isArray(dataTersimpan)) {
    siswa = dataTersimpan.filter(
      item =>
        item &&
        typeof item.id === "string" &&
        typeof item.nama === "string" &&
        typeof item.kelas === "string"
    );
  }
} catch (error) {
  siswa = [];
}

function simpanData() {
  localStorage.setItem("bayarKasSiswa", JSON.stringify(siswa));
}

function tampilkanSiswa() {
  const kataKunci = inputCari.value.trim().toLowerCase();

  const hasil = siswa.filter(item =>
    item.nama.toLowerCase().includes(kataKunci) ||
    item.kelas.toLowerCase().includes(kataKunci)
  );

  daftarSiswa.innerHTML = "";

  if (hasil.length === 0) {
    const baris = document.createElement("tr");
    const kolom = document.createElement("td");

    kolom.colSpan = 4;
    kolom.className = "empty-state";
    kolom.textContent = siswa.length
      ? "Data siswa tidak ditemukan."
      : "Belum ada data siswa.";

    baris.appendChild(kolom);
    daftarSiswa.appendChild(baris);
  } else {
    hasil.forEach((item, index) => {
      const baris = document.createElement("tr");

      const nomor = document.createElement("td");
      nomor.textContent = index + 1;

      const nama = document.createElement("td");
      nama.textContent = item.nama;

      const kelas = document.createElement("td");
      kelas.textContent = item.kelas;

      const aksi = document.createElement("td");
      aksi.className = "student-actions";

      const tombolEdit = document.createElement("button");
      tombolEdit.type = "button";
      tombolEdit.textContent = "Edit";
      tombolEdit.className = "action-edit";
      tombolEdit.addEventListener("click", () => editSiswa(item.id));

      const tombolHapus = document.createElement("button");
      tombolHapus.type = "button";
      tombolHapus.textContent = "Hapus";
      tombolHapus.className = "action-delete";
      tombolHapus.addEventListener("click", () => hapusSiswa(item.id));

      aksi.append(tombolEdit, tombolHapus);
      baris.append(nomor, nama, kelas, aksi);
      daftarSiswa.appendChild(baris);
    });
  }

  totalSiswa.textContent = `${siswa.length} siswa`;

  if (jumlahSiswa) {
    jumlahSiswa.textContent = `${siswa.length} siswa`;
  }
}

formSiswa.addEventListener("submit", event => {
  event.preventDefault();

  const nama = inputNama.value.trim();
  const kelas = inputKelas.value.trim();

  if (!nama || !kelas) {
    alert("Nama dan kelas siswa wajib diisi.");
    return;
  }

  if (inputId.value) {
    const index = siswa.findIndex(item => item.id === inputId.value);

    if (index !== -1) {
      siswa[index].nama = nama;
      siswa[index].kelas = kelas;
    }
  } else {
    siswa.push({
      id: crypto.randomUUID(),
      nama,
      kelas
    });
  }

  simpanData();
  resetForm();
  tampilkanSiswa();
});

function editSiswa(id) {
  const item = siswa.find(siswaItem => siswaItem.id === id);
  if (!item) return;

  inputId.value = item.id;
  inputNama.value = item.nama;
  inputKelas.value = item.kelas;
  tombolSimpan.textContent = "Simpan Perubahan";
  tombolBatal.hidden = false;

  formSiswa.scrollIntoView({ behavior: "smooth", block: "center" });
  inputNama.focus();
}

function hapusSiswa(id) {
  const item = siswa.find(siswaItem => siswaItem.id === id);
  if (!item) return;

  if (!confirm(`Yakin ingin menghapus data ${item.nama}?`)) return;

  siswa = siswa.filter(siswaItem => siswaItem.id !== id);

  simpanData();
  resetForm();
  tampilkanSiswa();
}

function resetForm() {
  formSiswa.reset();
  inputId.value = "";
  tombolSimpan.textContent = "Tambah Siswa";
  tombolBatal.hidden = true;
}

tombolBatal.addEventListener("click", resetForm);
inputCari.addEventListener("input", tampilkanSiswa);

tampilkanSiswa();
