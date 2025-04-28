// تهيئة الخريطة
document.addEventListener('DOMContentLoaded', function() {
    try {
        // إنشاء الخريطة
        const map = L.map('map-container').setView([30.5883, 31.4958], 13);

        // إضافة طبقة الخريطة الأساسية
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(map);

        // إضافة حدود مدينة الزقازيق
        if (zagazigBaseMap) {
            L.geoJSON(zagazigBaseMap, {
                style: {
                    color: '#4B5563',
                    weight: 2,
                    opacity: 0.5,
                    fillColor: '#f0f0f0',
                    fillOpacity: 0.2
                }
            }).addTo(map);
        }

        // إنشاء مجموعة العلامات
        const wasteBinsLayer = L.layerGroup().addTo(map);
        let userLocationMarker = null;
        let nearestBinMarker = null;
        let routeLine = null;

        // إضافة علامات حاويات النفايات
        if (wasteBinsData && wasteBinsData.features) {
            wasteBinsData.features.forEach(bin => {
                const marker = L.marker(bin.geometry.coordinates.reverse(), {
                    icon: L.divIcon({
                        className: 'waste-bin-marker',
                        html: `<div style="background-color: ${bin.properties.status === 'متاح' ? '#4CAF50' : '#F44336'}; 
                                width: 16px; 
                                height: 16px; 
                                border-radius: 50%; 
                                border: 2px solid white;"></div>`,
                        iconSize: [20, 20]
                    })
                }).addTo(wasteBinsLayer);
                
                marker.bindPopup(`
                    <div class="p-2">
                        <h3 class="font-bold">${bin.properties.type}</h3>
                        <p>العنوان: ${bin.properties.address}</p>
                        <p>الحالة: ${bin.properties.status}</p>
                        <p>السعة: ${bin.properties.capacity}</p>
                    </div>
                `);
            });
        }

        // إضافة زر البحث عن أقرب حاوية
        const findNearestBinButton = document.createElement('button');
        findNearestBinButton.textContent = 'البحث عن أقرب حاوية';
        findNearestBinButton.className = 'bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 mt-2';
        document.querySelector('#map').insertBefore(findNearestBinButton, document.querySelector('#map-container'));

        // دالة لحساب المسافة بين نقطتين
        function calculateDistance(lat1, lon1, lat2, lon2) {
            const R = 6371; // نصف قطر الأرض بالكيلومتر
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
                    Math.sin(dLon/2) * Math.sin(dLon/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            return R * c * 1000; // المسافة بالمتر
        }

        // دالة للتحقق من أن النقطة تقع داخل حدود المدينة
        function isPointInCity(lat, lon) {
            const cityBounds = zagazigBaseMap.features[0].geometry.coordinates[0];
            let inside = false;
            
            // التحقق من أن النقطة تقع داخل الحد الأدنى والأقصى للإحداثيات
            const minLat = Math.min(...cityBounds.map(point => point[1]));
            const maxLat = Math.max(...cityBounds.map(point => point[1]));
            const minLon = Math.min(...cityBounds.map(point => point[0]));
            const maxLon = Math.max(...cityBounds.map(point => point[0]));
            
            // تطبيق خوارزمية Ray Casting
            for (let i = 0, j = cityBounds.length - 1; i < cityBounds.length; j = i++) {
                const xi = cityBounds[i][1], yi = cityBounds[i][0];
                const xj = cityBounds[j][1], yj = cityBounds[j][0];
                
                // التحقق من تقاطع الخط مع الشعاع
                const intersect = ((yi > lon) !== (yj > lon))
                    && (lat <= (xj - xi) * (lon - yi) / (yj - yi) + xi);
                if (intersect) inside = !inside;
            }
            
            return inside;
        }

        // دالة للبحث عن أقرب حاوية
        function findNearestBin(position) {
            const userLat = position.coords.latitude;
            const userLon = position.coords.longitude;

            // التحقق من أن المستخدم داخل حدود الزقازيق
            if (!isPointInCity(userLat, userLon)) {
                alert('يجب أن تكون داخل حدود مدينة الزقازيق للبحث عن أقرب حاوية');
                return;
            }

            // إزالة العلامات القديمة
            if (userLocationMarker) {
                map.removeLayer(userLocationMarker);
            }
            if (nearestBinMarker) {
                map.removeLayer(nearestBinMarker);
            }
            if (routeLine) {
                map.removeLayer(routeLine);
            }

            // إضافة علامة موقع المستخدم
            userLocationMarker = L.marker([userLat, userLon], {
                icon: L.divIcon({
                    className: 'user-location-marker',
                    html: `<div style="background-color: #3B82F6; 
                            width: 16px; 
                            height: 16px; 
                            border-radius: 50%; 
                            border: 2px solid white;"></div>`,
                    iconSize: [20, 20]
                })
            }).addTo(map);

            // البحث عن أقرب حاوية
            let nearestBin = null;
            let minDistance = Infinity;

            wasteBinsData.features.forEach(bin => {
                const distance = calculateDistance(
                    userLat,
                    userLon,
                    bin.geometry.coordinates[1],
                    bin.geometry.coordinates[0]
                );

                if (distance < minDistance) {
                    minDistance = distance;
                    nearestBin = bin;
                }
            });

            if (nearestBin) {
                // إضافة علامة لأقرب حاوية
                nearestBinMarker = L.marker([nearestBin.geometry.coordinates[1], nearestBin.geometry.coordinates[0]], {
                    icon: L.divIcon({
                        className: 'nearest-bin-marker',
                        html: `<div style="background-color: #FFD700; 
                                width: 16px; 
                                height: 16px; 
                                border-radius: 50%; 
                                border: 2px solid white;"></div>`,
                        iconSize: [20, 20]
                    })
                }).addTo(map);

                // إضافة خط بين موقع المستخدم وأقرب حاوية
                routeLine = L.polyline([
                    [userLat, userLon],
                    [nearestBin.geometry.coordinates[1], nearestBin.geometry.coordinates[0]]
                ], {
                    color: '#3B82F6',
                    weight: 2,
                    dashArray: '5, 10'
                }).addTo(map);

                // عرض معلومات أقرب حاوية
                nearestBinMarker.bindPopup(`
                    <div class="p-2">
                        <h3 class="font-bold">أقرب حاوية نفايات في الزقازيق</h3>
                        <p>العنوان: ${nearestBin.properties.address}</p>
                        <p>الحالة: ${nearestBin.properties.status}</p>
                        <p>السعة: ${nearestBin.properties.capacity}</p>
                        <p>المسافة: ${Math.round(minDistance)} متر</p>
                        <button onclick="navigateToBin(${nearestBin.geometry.coordinates[1]}, ${nearestBin.geometry.coordinates[0]})" 
                                class="mt-2 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
                            ابدأ التنقل
                        </button>
                    </div>
                `).openPopup();

                // تكبير الخريطة لرؤية المسار
                const bounds = L.latLngBounds([
                    [userLat, userLon],
                    [nearestBin.geometry.coordinates[1], nearestBin.geometry.coordinates[0]]
                ]);
                map.fitBounds(bounds, { padding: [50, 50] });
            }
        }

        // دالة للتنقل إلى الحاوية
        function navigateToBin(lat, lon) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((position) => {
                    const userLat = position.coords.latitude;
                    const userLon = position.coords.longitude;
                    
                    // فتح خرائط جوجل مع اتجاهات التنقل
                    window.open(`https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLon}&destination=${lat},${lon}&travelmode=walking`);
                });
            }
        }

        // إضافة مستمع حدث لزر البحث عن أقرب حاوية
        findNearestBinButton.addEventListener('click', () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    findNearestBin,
                    (error) => {
                        alert('تعذر الحصول على موقعك. يرجى التأكد من تفعيل خدمة الموقع.');
                        console.error('خطأ في الحصول على الموقع:', error);
                    }
                );
            } else {
                alert('متصفحك لا يدعم خدمة الموقع.');
            }
        });

        // إضافة وظيفة البحث
        const searchInput = document.getElementById('search-input');
        const searchButton = document.getElementById('search-button');
        let searchMarker = null;

        function searchLocation() {
            const query = searchInput.value.trim();
            if (!query) return;

            // استخدام Nominatim للبحث عن الموقع
            fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', الزقازيق')}`)
                .then(response => response.json())
                .then(data => {
                    if (data && data.length > 0) {
                        const result = data[0];
                        const lat = parseFloat(result.lat);
                        const lon = parseFloat(result.lon);

                        // إزالة العلامة القديمة إذا وجدت
                        if (searchMarker) {
                            map.removeLayer(searchMarker);
                        }

                        // إضافة علامة جديدة
                        searchMarker = L.marker([lat, lon]).addTo(map);
                        searchMarker.bindPopup(`<div class="p-2">${result.display_name}</div>`).openPopup();

                        // تكبير الخريطة إلى الموقع
                        map.setView([lat, lon], 15);
                    } else {
                        alert('لم يتم العثور على الموقع المطلوب');
                    }
                })
                .catch(error => {
                    console.error('خطأ في البحث:', error);
                    alert('حدث خطأ أثناء البحث. يرجى المحاولة مرة أخرى.');
                });
        }

        // إضافة مستمعي الأحداث
        searchButton.addEventListener('click', searchLocation);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchLocation();
            }
        });

    } catch (error) {
        console.error('حدث خطأ في تحميل الخريطة:', error);
        document.getElementById('map-container').innerHTML = '<div class="text-center p-4 text-red-600">حدث خطأ في تحميل الخريطة. يرجى تحديث الصفحة.</div>';
    }
});

// معالجة نموذج الشكاوى
const complaintForm = document.querySelector('form');
if (complaintForm) {
    complaintForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // جمع بيانات النموذج
        const formData = new FormData(complaintForm);
        const complaint = Object.fromEntries(formData.entries());
        
        // هنا يمكنك إضافة كود لإرسال الشكوى إلى الخادم
        console.log('تم إرسال الشكوى:', complaint);
        
        // عرض رسالة نجاح
        alert('تم إرسال شكواك بنجاح! سنتواصل معك قريباً.');
        complaintForm.reset();
    });
}

// إضافة تأثيرات التمرير السلس
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
}); 