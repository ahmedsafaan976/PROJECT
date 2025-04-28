// بيانات الخريطة الأساسية لمدينة الزقازيق
const zagazigBaseMap = {
    type: 'FeatureCollection',
    features: [
        {
            type: 'Feature',
            properties: {
                name: 'مدينة الزقازيق',
                type: 'city'
            },
            geometry: {
                type: 'Polygon',
                coordinates: [[
                    [31.4858, 30.5783],
                    [31.5058, 30.5783],
                    [31.5058, 30.5983],
                    [31.4858, 30.5983],
                    [31.4858, 30.5783]
                ]]
            }
        }
    ]
};

// بيانات حاويات النفايات
const wasteBinsData = {
    type: 'FeatureCollection',
    features: [
        {
            type: 'Feature',
            properties: {
                id: 1,
                type: 'حاوية عامة',
                status: 'متاح',
                capacity: '60%',
                address: 'شارع أحمد عرابي - أمام الجامعة'
            },
            geometry: {
                type: 'Point',
                coordinates: [31.4958, 30.5883]
            }
        },
        {
            type: 'Feature',
            properties: {
                id: 2,
                type: 'حاوية عامة',
                status: 'متاح',
                capacity: '40%',
                address: 'شارع محمد فريد - أمام المستشفى الجامعي'
            },
            geometry: {
                type: 'Point',
                coordinates: [31.4858, 30.5883]
            }
        },
        {
            type: 'Feature',
            properties: {
                id: 3,
                type: 'حاوية عامة',
                status: 'ممتلئ',
                capacity: '100%',
                address: 'شارع سعد زغلول - أمام محطة القطار'
            },
            geometry: {
                type: 'Point',
                coordinates: [31.5058, 30.5883]
            }
        },
        {
            type: 'Feature',
            properties: {
                id: 4,
                type: 'حاوية عامة',
                status: 'متاح',
                capacity: '30%',
                address: 'شارع عبد الله النديم - أمام مدرسة الزقازيق الثانوية'
            },
            geometry: {
                type: 'Point',
                coordinates: [31.4958, 30.5783]
            }
        },
        {
            type: 'Feature',
            properties: {
                id: 5,
                type: 'حاوية عامة',
                status: 'ممتلئ',
                capacity: '100%',
                address: 'شارع مصطفى كامل - أمام حديقة الطفل'
            },
            geometry: {
                type: 'Point',
                coordinates: [31.4858, 30.5983]
            }
        },
        {
            type: 'Feature',
            properties: {
                id: 6,
                type: 'حاوية عامة',
                status: 'متاح',
                capacity: '50%',
                address: 'شارع الجلاء - أمام مسجد النور'
            },
            geometry: {
                type: 'Point',
                coordinates: [31.4908, 30.5853]
            }
        },
        {
            type: 'Feature',
            properties: {
                id: 7,
                type: 'حاوية عامة',
                status: 'متاح',
                capacity: '70%',
                address: 'شارع الثورة - أمام سوق الخضار'
            },
            geometry: {
                type: 'Point',
                coordinates: [31.5008, 30.5903]
            }
        },
        {
            type: 'Feature',
            properties: {
                id: 8,
                type: 'حاوية عامة',
                status: 'ممتلئ',
                capacity: '100%',
                address: 'شارع النصر - أمام محطة البنزين'
            },
            geometry: {
                type: 'Point',
                coordinates: [31.4958, 30.5953]
            }
        }
    ]
}; 