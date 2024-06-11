import { useTheme } from '@rneui/themed';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-gifted-charts'; // Import LineChart from gifted-charts
import { useRecoilState } from 'recoil';
import { styleState } from '../../store';
import { ScaledSheet } from 'react-native-size-matters';

export default function CoughView({ coughs }) {
    const { theme } = useTheme();
    const [style, setStyle] = useRecoilState(styleState);

    const renderCoughChart = () => {
        // Group the coughs by day and calculate the count for each day, also group them by month {"1-1": 2, "2-1": 4} so give the month and the day. Only give the last month
        const coughsByDay = coughs.reduce((acc, cough) => {
            const date = new Date(cough.timeStamp);
            const day = date.getDate();
            const month = date.getMonth() + 1;
            acc[`${month}-${day}`] = (acc[`${month}-${day}`] || 0) + 1;
            return acc;
        }, {});

        // get the total number of coughs
        const totalCoughs = coughs.length;

        // Function to get the ordinal suffix for a number (e.g., 1st, 2nd, 3rd)
        const getOrdinalSuffix = (number) => {
            const j = number % 10;
            const k = number % 100;
            if (j === 1 && k !== 11) {
                return 'st';
            }
            if (j === 2 && k !== 12) {
                return 'nd';
            }
            if (j === 3 && k !== 13) {
                return 'rd';
            }
            return 'th';
        };

        // Create arrays for labels (days) and data (fall count for each day)
        // format the data for the chart [{value: 1, label: '1st'}, {value: 2, label: '2nd'}]µ
        const labelsBarChart = Object.keys(coughsByDay).map((label) => {
            const day = label.split('-')[1];
            return `${parseInt(day)}${getOrdinalSuffix(parseInt(day))}`;
        });

        const dataBarChart = Object.values(coughsByDay).map((value, index) => {
            return {
                value,
                label: labelsBarChart[index],
            };
        });

        return (
            <>
                <Text style={[style.h2, styles.center]}>Coughs per day</Text>
                <LineChart
                    data={dataBarChart}
                    color={theme.primary}
                    dataPointsColor={theme.primary}
                    width={styles.chart.width}
                    lineWidth={styles.chart.lineWidth}
                    yAxisThickness={0}
                    xAxisThickness={styles.chart.xAxisThickness}
                    xAxisColor="silver"
                    curved
                    curveType={'bezier'}
                    // maxValue is 1 above the max value in the data, except when the max value is lower than 10
                    // then the max value is 10
                    maxValue={Math.max(Math.max(...dataBarChart.map((item) => item.value)) + 1, 10)}
                    dashGap={10}
                    spacing={styles.chart.spacing}
                    showFraction={false}
                    // set the number of sections dynamically based on the max value, so all the numbers are divisable by 2. And show max 8 sections
                    noOfSections={Math.min(Math.max(Math.max(...dataBarChart.map((item) => item.value)) + 1, 10) / 2, 8)}
                />
                <Text style={[style.h2, styles.center, {marginTop: 20}]}>{`Total coughs: ${totalCoughs}`}</Text>
            </>
        );
    };

    return (
        <View style={styles.marginX}>
            {coughs.length > 0 && renderCoughChart() || <Text>No coughs recorded</Text>}
        </View>
    );
}

const styles = ScaledSheet.create({
    center: {
        textAlign: 'center',
    },
    marginX: {
        marginHorizontal: 16,
    },
    chart: {
        width: '280@ms0.9',
        lineWidth: '4@ms',
        xAxisThickness: '1@ms',
        spacing: '40@ms',
    }
});
