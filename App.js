import React, { useState, useEffect } from 'react';
import {
    FlatList,
    StatusBar,
    Text,
    TextInput,
    View,
    StyleSheet,
    Button,
    Dimensions,
    TouchableOpacity,
} from 'react-native';
import Slider from '@react-native-community/slider';

const { width } = Dimensions.get('window');

let originalData = [];




const App = () => {
    const [mydata, setMydata] = useState([]);
    const [sortOrder, setSortOrder] = useState('asc'); // Ascending or Descending
    const [sortKey, setSortKey] = useState(''); // Fame or Popularity
    const [searchText, setSearchText] = useState(''); // Track search input

    useEffect(() => {
        fetch(
            "https://mysafeinfo.com/api/data?list=usfavoritebeers&format=json&case=default"
        )
            .then((response) => response.json())
            .then((myJson) => {
                if (originalData.length < 1) {
                    originalData = myJson.filter((item) => item && item.DrinkName);
                    setMydata(originalData);
                }
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
            });
    }, []);

    const FilterData = (text) => {
        setSearchText(text); // Update the search text state
        if (text.trim() !== "") {
            const filteredData = originalData.filter((item) =>
                item.DrinkName.toLowerCase().includes(text.toLowerCase())
            );
            setMydata(filteredData);
        } else {
            setMydata(originalData);
        }
    };

    const sortData = (key) => {
        const sortedData = [...mydata].sort((a, b) => {
            if (sortOrder === 'asc') {
                return a[key] - b[key];
            } else {
                return b[key] - a[key];
            }
        });
        setMydata(sortedData);
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); // Toggle sort order
        setSortKey(key); // Set the current sort key
    };

    const clearFilters = () => {
        setMydata(originalData); // Reset data to original
        setSortKey(''); // Clear sorting key
        setSortOrder('asc'); // Reset sort order
        setSearchText(''); // Clear search input
    };

    const getFameColor = (percentage) => {
        if (percentage > 80) return "#4caf50"; // Green for high fame
        if (percentage > 50) return "#ffc107"; // Yellow for medium fame
        return "#f44336"; // Red for low fame
    };

    const getPopularityColor = (percentage) => {
        if (percentage > 80) return "#2196f3"; // Blue for high popularity
        if (percentage > 50) return "#ff9800"; // Orange for medium popularity
        return "#e91e63"; // Pink for low popularity
    };

    const renderItem = ({ item, index }) => {
        const cleanedName = item.DrinkName
            .split(" ")
            .filter((word, index, array) => array.indexOf(word) === index)
            .join(" ");

        let rankStyle = {};
        let rankLabel = "";
        if (index === 0) {
            rankStyle = styles.gold;
            rankLabel = "🥇";
        } else if (index === 1) {
            rankStyle = styles.silver;
            rankLabel = "🥈";
        } else if (index === 2) {
            rankStyle = styles.bronze;
            rankLabel = "🥉";
        }

        return (
            <View style={styles.listItem}>
                <Text style={[styles.rankText, rankStyle]}>
                    {rankLabel} Rank #{index + 1}
                </Text>
                <Text style={styles.listItemText}>{cleanedName}</Text>
                <View>
                    <Text style={styles.detailsText}>Fame</Text>
                    <View style={styles.progressBarContainer}>
                        <View
                            style={[
                                styles.progressBarFill,
                                { width: `${item.FamePct}%`, backgroundColor: getFameColor(item.FamePct) },
                            ]}
                        />
                    </View>
                    <Text style={styles.percentageText}>{item.FamePct}%</Text>
                </View>
                <View>
                    <Text style={styles.detailsText}>Popularity</Text>
                    <View style={styles.progressBarContainer}>
                        <View
                            style={[
                                styles.progressBarFill,
                                { width: `${item.PopularityPct}%`, backgroundColor: getPopularityColor(item.PopularityPct) },
                            ]}
                        />
                    </View>
                    <Text style={styles.percentageText}>{item.PopularityPct}%</Text>
                </View>
            </View>
        );
    };


    return (
        <View style={styles.container}>
            <StatusBar />
            <Text style={styles.header}>Beer Ranking App:</Text>
            <TextInput
                style={styles.searchBar}
                placeholder="Search for a drink..."
                value={searchText}
                onChangeText={(text) => FilterData(text)}
            />
            <View style={styles.sortButtons}>
                <View style={styles.buttonContainer}>
                    <Button title="Sort by Fame" onPress={() => sortData("FamePct")} />
                </View>
                <View style={styles.buttonContainer}>
                    <Button title="Sort by Popularity" onPress={() => sortData("PopularityPct")} />
                </View>
            </View>

            <View>
                <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
                    <Text style={styles.clearButtonText}>Clear / Back to Normal</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.sortStatus}>
                {sortKey
                    ? `Sorted by: ${
                        sortKey === 'FamePct' ? 'Fame' : 'Popularity'
                    } (${sortOrder === 'asc' ? 'Ascending' : 'Descending'})`
                    : 'No Sorting Applied'}
            </Text>
            <FlatList
                data={mydata}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderItem}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f7f3e9",
        padding: 10,
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        marginVertical: 10,
        color: "#222",
    },
    searchBar: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        margin: 10,
        backgroundColor: "#f9f9f9",
    },
    sortButtons: {
        flexDirection: "row",       // Align buttons in a row
        justifyContent: "space-between",
        marginVertical: 10,         // Space above and below the button group
    },
    buttonContainer: {
        flex: 1,                   // Make each button take up equal space
        marginHorizontal: 5,       // Add 10px spacing (5px on each side of the button)
    },
    sortStatus: {
        textAlign: "center",
        fontSize: 16,
        color: "#555",
        marginVertical: 10,
    },
    listItem: {
        backgroundColor: "#fff",
        borderRadius: 8,
        padding: 15,
        marginVertical: 5,
        marginHorizontal: 10,
        width: width - 20,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    rankText: {
        fontSize: 16,
        fontWeight: "bold",
    },
    gold: {
        color: "#FFD700",
    },
    silver: {
        color: "#C0C0C0",
    },
    bronze: {
        color: "#CD7F32",
    },
    listItemText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
    },
    detailsText: {
        fontSize: 14,
        color: "#555",
        marginVertical: 5,
    },
    progressBar: {
        marginVertical: 5,
        width: width - 50,
    },
    clearButton: {
        backgroundColor: "#FF6347", // Tomato red color
        padding: 8,
        marginLeft: 5,
        marginRight: 5,// Add padding inside the button
        borderRadius: 2,           // Rounded corners
        alignItems: "center",      // Center the text
        justifyContent: "center",  // Center text vertically
    },
    clearButtonText: {
        color: "#fff",             // White text color
        fontSize: 16,              // Font size
        fontWeight: "bold",        // Bold text
    },
    progressBarContainer: {
        height: 10,                // Height of the progress bar
        width: "100%",             // Full width of the container
        backgroundColor: "#ddd",   // Background color for the progress bar track
        borderRadius: 5,           // Rounded corners
        overflow: "hidden",        // Ensure the fill doesn't overflow the container
        marginVertical: 5,         // Space between progress bars
    },
    progressBarFill: {
        height: "100%",            // Fill the full height of the parent container
        borderRadius: 5,           // Match the parent's border radius
    },
    percentageText: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#555",
        textAlign: "right",
        marginBottom: 5,
    },


});

export default App;
