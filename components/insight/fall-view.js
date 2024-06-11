import React from 'react';
import { useRecoilState } from 'recoil';
import { styleState } from '../../store';
import { useTheme } from '@rneui/themed';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LineChart, PieChart } from "react-native-gifted-charts";
import { getISOWeek } from 'date-fns';
import { ScaledSheet } from 'react-native-size-matters';

export default function FallView({ falls }) {
    const { theme } = useTheme();
    const [style, setStyle] = useRecoilState(styleState);

    // Group the falls by week and count the falls for each week
    const fallsByWeek = falls.reduce((acc, fall) => {
        const date = new Date(fall.timeStamp);
        const week = getISOWeek(date);
        acc[week] = (acc[week] || 0) + 1;
        return acc;
    }, {});

    // Create arrays for labels (days) and data (fall count for each day)
    // format the data for the chart [{value: 1, label: '1st'}, {value: 2, label: '2nd'}]
    const labelsLineChart = Object.keys(fallsByWeek).map(String);
    const dataLineChart = Object.values(fallsByWeek).map((value, index) => {
        return {
            value,
            label: "week " + labelsLineChart[index],
        };
    });

    // group the falls by fall.cameraRoom.name
    const fallsByRoom = falls.reduce((acc, fall) => {
        const room = fall.cameraRoom.name;
        acc[room] = (acc[room] || 0) + 1;
        return acc;
    }, {});

    // make a list of colors for the pie chart
    const colors = [theme.primary, theme.secondary, theme.tertiary, theme.fourth, theme.fifth];

    // Create arrays for labels (rooms) and data (fall count for each room)
    const labelsPieChart = Object.keys(fallsByRoom);
    // format the data for the chart [{value: 1, text: 'Living Room', color: theme.primary}, {value: 2, text: 'Garage', color: theme.secondary}]
    const dataPieChart = Object.values(fallsByRoom).map((value, index) => {
        return {
            value,
            text: labelsPieChart[index],
            color: colors[index],
        };
    });

    const renderLegend = (text, color) => {
        return (
            <View style={styles.legend} key={text}>
                <View
                    style={{
                        height: 18,
                        width: 18,
                        marginRight: 10,
                        borderRadius: 4,
                        backgroundColor: color || 'white',
                    }}
                />
                <Text style={{ color: theme.text, fontSize: 16 }}>{text || ''}</Text>
            </View>
        );
    };

    function renderLegendPieChart() {
        return (
            <View style={styles.legendContainer}>
                {dataPieChart.map((item) => renderLegend(item.text, item.color))}
            </View>
        );
    }

    return (
        <ScrollView style={styles.marginX}>
            {falls.length > 0 ? (
                <View>
                    <Text style={[style.h2, styles.center]}>Falls per week</Text>
                    <LineChart
                        data={dataLineChart}
                        color={theme.primary}
                        dataPointsColor={theme.primary}
                        width={styles.chart.width}
                        lineWidth={styles.chart.lineWidth}
                        yAxisThickness={0}
                        xAxisThickness={styles.chart.xAxisThickness}
                        xAxisColor="silver"
                        curved
                        curveType={'bezier'}
                        // maxValue is 1 above the max value in the data, except when the max value is lower than 10, then the max value is 10. The maxValue always needs to be a multiple of 2
                        maxValue={Math.max(Math.max(...dataLineChart.map((item) => item.value)) + 1, 10)}
                        dashGap={10}
                        spacing={styles.chart.spacing}
                        initialSpacing={25}
                        showFraction={false}
                        // set the number of sections dynamically based on the max value, so all the numbers are divisable by 2. And show max 8 sections
                        noOfSections={Math.min(Math.max(Math.max(...dataLineChart.map((item) => item.value)) + 1, 10) / 2, 8)}
                    />
                    <Text style={[style.h2, styles.center, styles.margin]}>Falls per room</Text>
                    <View style={[style.containerRowSpaceBetween]}>
                        <PieChart
                            donut={true}
                            data={dataPieChart}
                            radius={styles.chart.radius}
                        />
                        {renderLegendPieChart()}
                    </View>
                </View>
            ) : (
                <Text>No falls recorded</Text>
            )}
        </ScrollView>
    );
}

const styles = ScaledSheet.create({
    center: {
        textAlign: 'center',
    },
    legend: {
        flexDirection: 'row',
        marginBottom: 12,
        alignItems: 'center',
    },
    legendContainer: {
        flexDirection: 'column',
        justifyContent: 'center',
    },
    margin: {
        marginTop: 30,
    },
    marginX: {
        marginHorizontal: 16,
    },
    chart: {
        width: '280@ms0.9',
        lineWidth: '4@ms',
        xAxisThickness: '1@ms',
        spacing: '50@ms',
        radius: '90@ms',
    }
});
