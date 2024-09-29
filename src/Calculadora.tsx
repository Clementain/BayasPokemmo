import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee, { AndroidImportance, TimestampTrigger, TriggerType, AndroidStyle } from '@notifee/react-native';


export const Calculadora = () => {
    const [simpleSpicy, setSimpleSpicy] = useState('');
    const [simpleSpicySell, setSimpleSpicySell] = useState('0');
    const [verySpicy, setVerySpicy] = useState('');
    const [simpleSweet, setSimpleSweet] = useState('');
    const [simpleSweetSell, setSimpleSweetSell] = useState('0');
    const [verySweet, setVerySweet] = useState('');
    const [verySweetSell, setVerySweetSell] = useState('0');

    // Estado para la baya seleccionada (solo una puede estar seleccionada)
    const [selectedBaya, setSelectedBaya] = useState<string | null>(null);

    // Estados para las horas
    const [horaPlantacion, setHoraPlantacion] = useState('00:00 AM');
    const [horaRiego, setHoraRiego] = useState('00:00 AM');
    const [horaRiegoDate, setHoraRiegoDate] = useState<Date | null>(null);
    const [horaRecogida, setHoraRecogida] = useState('00:00 AM');
    const [horaRecogidaDate, setHoraRecogidaDate] = useState<Date | null>(null);

    // Guardar los datos en AsyncStorage cada vez que cambian las horas o la baya
    useEffect(() => {
        const saveData = async () => {
            try {
                await AsyncStorage.setItem('horaPlantacion', horaPlantacion);
                await AsyncStorage.setItem('horaRiego', horaRiego);
                await AsyncStorage.setItem('horaRecogida', horaRecogida);
                await AsyncStorage.setItem('selectedBaya', selectedBaya || '');
            } catch (e: any) {
                Alert.alert('Error guardando los datos: ', e);
            }
        };

        if (selectedBaya) {
            saveData(); // Guardar cada vez que cambie una baya o una hora
        }
    }, [horaPlantacion, horaRiego, horaRecogida, selectedBaya]);

    // Recuperar los datos de AsyncStorage al iniciar la app
    useEffect(() => {
        const loadStoredData = async () => {
            try {
                const storedPlantacion = await AsyncStorage.getItem('horaPlantacion');
                const storedRiego = await AsyncStorage.getItem('horaRiego');
                const storedRecogida = await AsyncStorage.getItem('horaRecogida');
                const storedBaya = await AsyncStorage.getItem('selectedBaya');

                if (storedPlantacion) setHoraPlantacion(storedPlantacion);
                if (storedRiego) setHoraRiego(storedRiego);
                if (storedRecogida) setHoraRecogida(storedRecogida);
                if (storedBaya) setSelectedBaya(storedBaya);
            } catch (e: any) {
                Alert.alert('Error al recuperar los datos: ', e);
            }
        };
        loadStoredData();
    }, []);


    async function createNotificationChannel() {
        await notifee.createChannel({
            id: 'default',
            name: 'Default Channel',
            importance: AndroidImportance.HIGH, // Asegúrate de que la importancia sea alta
        });
    }

    useEffect(() => {
        createNotificationChannel(); // Crea el canal cuando se monta el componente
    }, []);

    useEffect(() => {
        const requestPermissions = async () => {
            await notifee.requestPermission();
        };
        requestPermissions();
    }, []);



    const scheduleNotifications = async () => {
        try {
            if (!selectedBaya || !horaRiego || !horaRecogida) {
                Alert.alert('Error', 'Por favor, selecciona una baya y asegúrate de que las horas de riego y recogida estén definidas.');
                return;
            }

            const currentDate = new Date();

            // Map de íconos personalizados para las bayas
            const largeIconMap: { [key: string]: any } = {
                'Zreza': require('../assets/img/Baya_Zreza_EP.png'),
                'Meloc': require('../assets/img/Baya_Meloc_EP.png'),
                'Safre': require('../assets/img/Baya_Safre_EP.png'),
                'Zanama': require('../assets/img/Baya_Zanama_EP.png'),
            };

            const largeIcon = largeIconMap[selectedBaya];

            // Notificación para el riego
            if (horaRiegoDate && horaRiegoDate.getTime() > currentDate.getTime()) {
                const riegoTrigger: TimestampTrigger = {
                    type: TriggerType.TIMESTAMP,
                    timestamp: horaRiegoDate.getTime(),
                    alarmManager: {
                        allowWhileIdle: true,
                    },
                };

                await notifee.createTriggerNotification(
                    {
                        title: 'Recordatorio de Riego',
                        body: `Tus bayas ${selectedBaya} necesitan ser regadas`,
                        android: {
                            channelId: 'Riego BayasPokemmo',
                            pressAction: {
                                id: 'Riego BayasPokemmo',
                            },
                            largeIcon: largeIcon,  // Usa el ícono personalizado
                            smallIcon: 'ic_noti',
                            importance: AndroidImportance.HIGH,
                            sound: 'default',
                            style: {
                                type: AndroidStyle.BIGTEXT,
                                text: `Tus bayas ${selectedBaya} necesitan ser regadas`,
                            },
                        },
                    },
                    riegoTrigger
                );
            } else {
                Alert.alert('Error', 'La hora del riego es inválida o está en el pasado.');
            }

            // Notificación para la recogida
            if (horaRecogidaDate && horaRecogidaDate.getTime() > currentDate.getTime()) {
                const recogidaTrigger: TimestampTrigger = {
                    type: TriggerType.TIMESTAMP,
                    timestamp: horaRecogidaDate.getTime(),
                    alarmManager: {
                        allowWhileIdle: true,
                    },
                };

                await notifee.createTriggerNotification(
                    {
                        title: 'Recordatorio de Cosecha',
                        body: `Tus bayas ${selectedBaya} están listas para ser cosechadas`,
                        android: {
                            channelId: 'Cosecha BayasPokemmo',
                            pressAction: {
                                id: 'Cosecha BayasPokemmo',
                            },
                            largeIcon: largeIcon,  // Usa el ícono personalizado
                            smallIcon: 'ic_noti',
                            importance: AndroidImportance.HIGH,
                            sound: 'default',
                            style: {
                                type: AndroidStyle.BIGTEXT,
                                text: `Tus bayas ${selectedBaya} están listas para ser cosechadas`,
                            },
                        },
                    },
                    recogidaTrigger
                );
            } else {
                Alert.alert('Error', 'La hora de recogida es inválida o está en el pasado.');
            }

            Alert.alert('Notificaciones programadas', `Se han programado notificaciones para el riego y la cosecha de tus bayas ${selectedBaya}`);
        } catch (error) {
            Alert.alert('Error', (error as Error).message);
        }
    };




    const reset = async () => {
        setSimpleSpicy('');
        setSimpleSpicySell('0');
        setVerySpicy('');
        setSimpleSweet('');
        setSimpleSweetSell('0');
        setVerySweet('');
        setVerySweetSell('0');
        setSelectedBaya(null);
        setHoraPlantacion('00:00 AM');
        setHoraRiego('00:00 AM');
        setHoraRecogida('00:00 AM');

        try {
            await AsyncStorage.clear();
        } catch (e: any) {
            Alert.alert('Error limpiando AsyncStorage: ', e);
        }
    };

    const formatDateTime = (date: Date) => {
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = date.toLocaleDateString(undefined, options);

        let hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // La hora '0' debe ser '12'
        const formattedTime = `${hours}:${minutes} ${ampm}`;

        return { date: formattedDate, time: formattedTime };
    };


    const horas = () => {
        const currentDate = new Date();
        if (selectedBaya === 'Zanama') {
            const { date: plantacionDate, time: plantacionTime } = formatDateTime(currentDate);
            setHoraPlantacion(`${plantacionDate}\n${plantacionTime}`);

            const riegoDate = new Date(currentDate.getTime() + 8 * 60 * 60 * 1000);
            const { date: riegoFecha, time: riegoHora } = formatDateTime(riegoDate);
            setHoraRiego(`${riegoFecha}\n${riegoHora}`);
            setHoraRiegoDate(riegoDate);

            const recogidaDate = new Date(currentDate.getTime() + 20 * 60 * 60 * 1000);
            const { date: recogidaFecha, time: recogidaHora } = formatDateTime(recogidaDate);
            setHoraRecogida(`${recogidaFecha}\n${recogidaHora}`);
            setHoraRecogidaDate(recogidaDate);

        } else {
            const { date: plantacionDate, time: plantacionTime } = formatDateTime(currentDate);
            setHoraPlantacion(`${plantacionDate}\n${plantacionTime}`);

            Alert.alert(
                'Riego de Bayas',
                '¿Has regado las bayas al plantarlas?',
                [
                    {
                        text: 'No',
                        onPress: () => {
                            const riegoDate = new Date(currentDate.getTime() + 4 * 60 * 60 * 1000);
                            const { date: riegoFecha, time: riegoHora } = formatDateTime(riegoDate);
                            setHoraRiego(`${riegoFecha}\n${riegoHora}`);
                            setHoraRiegoDate(riegoDate);

                            const recogidaDate = new Date(currentDate.getTime() + 16 * 60 * 60 * 1000);
                            const { date: recogidaFecha, time: recogidaHora } = formatDateTime(recogidaDate);
                            setHoraRecogida(`${recogidaFecha}\n${recogidaHora}`);
                            setHoraRecogidaDate(recogidaDate);

                        }
                    },
                    {
                        text: 'Sí',
                        onPress: () => {
                            const riegoDate = new Date(currentDate.getTime() + 12 * 60 * 60 * 1000);
                            const { date: riegoFecha, time: riegoHora } = formatDateTime(riegoDate);
                            setHoraRiego(`${riegoFecha}\n${riegoHora}`);
                            setHoraRiegoDate(riegoDate);

                            const recogidaDate = new Date(currentDate.getTime() + 16 * 60 * 60 * 1000);
                            const { date: recogidaFecha, time: recogidaHora } = formatDateTime(recogidaDate);
                            setHoraRecogida(`${recogidaFecha}\n${recogidaHora}`);
                            setHoraRecogidaDate(recogidaDate);

                        }
                    }
                ]
            );
        }
    };


    const calculate = () => {
        if (Number(simpleSpicy) > 0 && Number(verySpicy) > 0) {
            const verySpicyLeft = Number(verySpicy) - 156;
            const simpleSpicyLeft = Number(simpleSpicy) - verySpicyLeft;
            const leftSpaces = 156 - verySpicyLeft;
            const simpleForHarvest = leftSpaces * 3;
            const spicyToSell = simpleSpicyLeft - simpleForHarvest;
            setSimpleSpicySell(spicyToSell.toString());
        }

        if (Number(simpleSweet) > 0 && Number(verySweet) > 0) {
            const simpleSweetLeft = Number(simpleSweet) - 156;
            const simpleSweetToSell = simpleSweetLeft - 156;
            const verySweetLeft = Number(verySweet) - 156;
            setSimpleSweetSell(simpleSweetToSell.toString());
            setVerySweetSell(verySweetLeft.toString());
        }
    };

    const toggleSelection = (baya: string) => {
        setSelectedBaya(baya === selectedBaya ? null : baya);
    };

    return (
        <ScrollView style={styles.container}>


            <View style={styles.iconsContainer}>
                <TouchableOpacity
                    style={[
                        styles.iconContainer,
                        selectedBaya === 'Zreza' ? styles.selected : null
                    ]}
                    onPress={() => toggleSelection('Zreza')}
                >
                    <Image source={require('../assets/img/Baya_Zreza_EP.png')} style={styles.icon} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.iconContainer,
                        selectedBaya === 'Meloc' ? styles.selected : null
                    ]}
                    onPress={() => toggleSelection('Meloc')}
                >
                    <Image source={require('../assets/img/Baya_Meloc_EP.png')} style={styles.icon} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.iconContainer,
                        selectedBaya === 'Safre' ? styles.selected : null
                    ]}
                    onPress={() => toggleSelection('Safre')}
                >
                    <Image source={require('../assets/img/Baya_Safre_EP.png')} style={styles.icon} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.iconContainer,
                        selectedBaya === 'Zanama' ? styles.selected : null
                    ]}
                    onPress={() => toggleSelection('Zanama')}
                >
                    <Image source={require('../assets/img/Baya_Zanama_EP.png')} style={styles.icon} />
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={styles.bayaButton}
                disabled={!selectedBaya}
                onPress={horas}
            >
                <Text style={styles.buttonText}>
                    {selectedBaya ? `Planté mis bayas ${selectedBaya}` : 'Selecciona una baya'}
                </Text>
            </TouchableOpacity>
            <Text style={styles.title}>
                {selectedBaya ? `Tiempos para las bayas ${selectedBaya}` : 'Selecciona una baya'}
            </Text>
            <View style={styles.tableContainer}>
                <View style={styles.tableRow}>
                    <Text style={styles.tableHeader}>Fecha Plantación</Text>
                    <Text style={styles.tableHeader}>Fecha Riego</Text>
                    <Text style={styles.tableHeader}>Fecha Recogida</Text>
                </View>
                <View style={styles.tableRow}>
                    <Text style={styles.tableCell}>{horaPlantacion}</Text>
                    <Text style={styles.tableCell}>{horaRiego}</Text>
                    <Text style={styles.tableCell}>{horaRecogida}</Text>
                </View>
            </View>
            <TouchableOpacity style={styles.calculateButton} onPress={scheduleNotifications}>
                <Text style={styles.buttonText}>Crear Recordatorio</Text>
            </TouchableOpacity>
            {/* Semillas Picantes */}
            <Text style={styles.sectionTitle}>Semillas Picantes:</Text>
            <View style={styles.seedRow}>
                <View style={styles.seedInputContainer}>
                    <Image source={require('../assets/img/picante.png')} style={styles.seedIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="#SIMPLES"
                        value={simpleSpicy.toString()}
                        onChangeText={(text) => setSimpleSpicy(text)}
                        keyboardType='numeric'
                        placeholderTextColor={'#888888'}
                    />
                </View>
                <View style={styles.seedInputContainer}>
                    <Image source={require('../assets/img/picante.png')} style={styles.seedIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="#MUY"
                        value={verySpicy.toString()}
                        onChangeText={(text) => setVerySpicy(text)}
                        keyboardType='numeric'
                        placeholderTextColor={'#888888'}
                    />
                </View>
            </View>

            {/* Semillas Dulces o Amargas */}
            <Text style={styles.sectionTitle}>Semillas Dulces o Amargas:</Text>
            <View style={styles.seedRow}>
                <View style={styles.seedInputContainer}>
                    <View style={styles.seedDoubleIcon}>
                        <Image source={require('../assets/img/dulce.png')} style={styles.seedIcon} />
                        <Image source={require('../assets/img/amarga.png')} style={styles.seedIcon} />
                    </View>
                    <TextInput
                        style={styles.input}
                        placeholder="#SIMPLES"
                        value={simpleSweet.toString()}
                        onChangeText={(text) => setSimpleSweet(text)}
                        keyboardType='numeric'
                        placeholderTextColor={'#888888'}
                    />
                </View>
                <View style={styles.seedInputContainer}>
                    <View style={styles.seedDoubleIcon}>
                        <Image source={require('../assets/img/dulce.png')} style={styles.seedIcon} />
                        <Image source={require('../assets/img/amarga.png')} style={styles.seedIcon} />
                    </View>
                    <TextInput
                        style={styles.input}
                        placeholder="#MUY"
                        value={verySweet.toString()}
                        onChangeText={(text) => setVerySweet(text)}
                        keyboardType='numeric'
                        placeholderTextColor={'#888888'}
                    />
                </View>
            </View>

            {/* Botón Calcular */}
            <TouchableOpacity style={styles.calculateButton} onPress={calculate}>
                <Text style={styles.buttonText}>Calcular</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.calculateButton} onPress={reset}>
                <Text style={styles.buttonText}>Reiniciar</Text>
            </TouchableOpacity>
            {/* Resultado */}
            <Text style={styles.resultTitle}>Semillas restantes para vender:</Text>
            <View style={styles.resultRow}>
                <Image source={require('../assets/img/picante.png')} style={styles.resultIcon} />
                <Text style={[styles.resultText, { color: '#FF5733' }]}>Picantes: {simpleSpicySell}</Text>
            </View>
            <View style={styles.resultRow}>
                <Image source={require('../assets/img/amarga.png')} style={styles.resultIcon} />
                <Text style={[styles.resultText, { color: '#FF00FF' }]}>Dulces o Amargas: {simpleSweetSell}</Text>
            </View>
            <View style={styles.resultRow}>
                <Image source={require('../assets/img/dulce.png')} style={styles.resultIcon} />
                <Text style={[styles.resultText, { color: '#00FF00' }]}>MUY dulces o MUY amargas: {verySweetSell}</Text>
            </View>
            <View style={{ height: 30 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#333',
        padding: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 20,
    },
    bayaButton: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#444',
        borderRadius: 10,
        padding: 10,
        marginBottom: 20,
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
    },
    iconsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    iconContainer: {
        padding: 10,
        borderRadius: 10,
    },
    selected: {
        backgroundColor: 'green',
    },
    icon: {
        width: 50,
        height: 50,
    },
    sectionTitle: {
        color: '#FF5733',
        marginBottom: 10,
    },
    seedRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    seedInputContainer: {
        alignItems: 'center',
        width: '45%',
    },
    seedIcon: {
        width: 30,
        height: 30,
        marginBottom: 5,
    },
    seedDoubleIcon: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    input: {
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 10,
        width: '100%',
        color: '#646464'
    },
    tableContainer: {
        marginVertical: 20,
        borderWidth: 1,
        borderColor: '#fff',
    },
    tableRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        borderBottomWidth: 1,
        borderColor: '#fff',
    },
    tableHeader: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
        flex: 1,
        padding: 10,
        borderRightWidth: 1,
        borderColor: '#fff',
    },
    tableCell: {
        color: '#fff',
        textAlign: 'center',
        flex: 1,
        padding: 10,
        borderRightWidth: 1,
        borderColor: '#fff',
    },
    calculateButton: {
        backgroundColor: '#000',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
    },
    resultTitle: {
        color: '#fff',
        marginBottom: 10,
    },
    resultRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    resultText: {
        color: '#fff',
        marginLeft: 10,
    },
    resultIcon: {
        width: 40,
        height: 40,
    },
});

export default Calculadora;