async function cetakAntrian(nomorAntrian) {
    const textToPrint = 
        "\n\n\n"+
        "=========== ANTRIAN ===========\n" +
        "Nomor: " + nomorAntrian + "\n" +
        new Date().toLocaleString() + "\n" +
        "Mohon menunggu giliran Anda.\n" +
        "================================\n"+
        "\n\n\n\n";

    try {
        if (!window.connectedPrinter) {
            $("#status").text("Printer belum terhubung. Harap hubungkan printer terlebih dahulu.");
            return;
        }

        $("#status").text("Menghubungkan ke printer...");
        const server = await window.connectedPrinter.gatt.connect();

        $("#status").text("Mendapatkan layanan pencetakan...");
        const service = await server.getPrimaryService("000018f0-0000-1000-8000-00805f9b34fb"); // Pastikan UUID layanan ini benar

        $("#status").text("Mendapatkan karakteristik pencetakan...");
        const characteristic = await service.getCharacteristic("00002af1-0000-1000-8000-00805f9b34fb"); // Gunakan UUID dari referensi teman Anda

        $("#status").text("Mencetak...");
        const encoder = new TextEncoder();
        const data = encoder.encode(textToPrint);

        await characteristic.writeValue(data);

        $("#status").text("Nomor antrian berhasil dicetak!");
        console.log("Success print", textToPrint);

    } catch (error) {
        $("#status").text("Gagal mencetak: " + error);
        console.error("Failed to print thermal", error);
        // Mungkin perlu mengatur window.connectedPrinter menjadi null jika koneksi gagal di tengah jalan
        // window.connectedPrinter = null;
    }
}

async function connectPrinter() {
    try {
        if (!navigator.bluetooth) {
            $("#status").text("Browser Anda tidak mendukung Web Bluetooth API.");
            return false;
        }

        $("#status").text("Meminta perangkat Bluetooth printer...");
        const device = await navigator.bluetooth.requestDevice({
            filters: [{ services: ['000018f0-0000-1000-8000-00805f9b34fb'] }] // Pastikan UUID layanan ini benar
        });

        $("#status").text("Menghubungkan ke: " + device.name);
        const server = await device.gatt.connect();

        $("#status").text("Mendapatkan layanan...");
        const service = await server.getPrimaryService("000018f0-0000-1000-8000-00805f9b34fb"); // Pastikan UUID layanan ini benar

        $("#status").text("Mendapatkan karakteristik...");
        const characteristic = await service.getCharacteristic("00002af1-0000-1000-8000-00805f9b34fb"); // Gunakan UUID dari referensi teman Anda

        window.connectedPrinter = device; // Simpan perangkat ke window
        $("#status").text("Printer berhasil terhubung dan disimpan.");
        return true;

    } catch (error) {
        $("#status").text("Gagal menghubungkan printer: " + error);
        console.error("Error menghubungkan printer:", error);
        window.connectedPrinter = null;
        return false;
    }
}

$(document).ready(function() {
    $("#btnCetak").on("click", async function() {
        $("#status").text("Mengambil nomor antrian...");
        $.ajax({
            url: "/get_nomor_antrian",
            type: "GET",
            dataType: "json",
            success: async function(data) {
                $("#status").text("Nomor antrian: " + data.nomor_antrian + ". Memproses pencetakan...");
                console.log("Nomor antrian:", data.nomor_antrian);
                const nomerAntrian = data.nomor_antrian;
                await cetakAntrian(nomerAntrian); // Perhatikan: data.nomorAntrian
            },
            error: function(error) {
                $("#status").text("Gagal mengambil nomor antrian.");
                console.error("Error:", error);
            }
        });
    });

    // Tambahkan tombol terpisah untuk menghubungkan printer (opsional, untuk koneksi manual di awal)
    const connectButton = $("<button id='btnConnectPrinter'>Hubungkan Printer Bluetooth</button>");
    $("body").prepend(connectButton);

    $("#btnConnectPrinter").on("click", async function() {
        await connectPrinter();
    });
});