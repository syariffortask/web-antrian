from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# Data antrian sederhana (bisa diganti dengan database)
# ini contoh yang sederhana
nomor_antrian_saat_ini = 0

@app.route('/')
def index():
    return render_template('antrian.html')

@app.route('/get_nomor_antrian')
def get_nomor_antrian():
    global nomor_antrian_saat_ini
    nomor_antrian_saat_ini += 1
    return jsonify({'nomor_antrian': nomor_antrian_saat_ini})

if __name__ == '__main__':
    app.run(debug=True,host='0.0.0.0')