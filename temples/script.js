document.getElementById('decodeButton').addEventListener('click', function() {
    const inputData = document.getElementById('inputData').value;
    const encodingTypes = Array.from(document.getElementById('encodingType').selectedOptions).map(option => option.value);

    let currentData = inputData;

    // تنفيذ فك التشفير لكل نوع تم اختياره
    const promises = encodingTypes.map(type => {
        return fetch('/decode', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ data: currentData, types: [type] })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('حدث خطأ أثناء فك التشفير');
            }
            return response.json();
        })
        .then(data => {
            currentData = data.result; // تحديث البيانات الحالية
        });
    });

    Promise.all(promises)
        .then(() => {
            document.getElementById('outputData').innerText = currentData;
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('outputData').innerText = 'حدث خطأ أثناء فك التشفير.';
        });
});
