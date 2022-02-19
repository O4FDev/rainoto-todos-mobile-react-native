import * as React from "react";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SignedIn, SignedOut, useClerk, useSession, useUser, } from "@clerk/clerk-expo";
import { log } from "../logger";
import axios from "axios";
import { ScrollView } from "react-native";
import { Button } from "react-native-web";
import DatePicker from '@dietime/react-native-date-picker';

export default function SafeMyProfileScreen(props) {
    return (React.createElement(React.Fragment, null,
        React.createElement(SignedIn, null,
            React.createElement(MyProfileScreen, Object.assign({}, props))),
        React.createElement(SignedOut, null,
            React.createElement(View, { style: styles.container },
                React.createElement(Text, null, "Unauthorized")))));
}
function MyProfileScreen({ navigation }) {
    const { signOut } = useClerk();
    const { getToken } = useSession();
    const { firstName, username } = useUser();
    const [sessionToken, setSessionToken] = React.useState("");
    const onSignOutPress = async () => {
        try {
            await signOut();
        }
        catch (err) {
            log("Error:> " + (err.errors ? err.errors[0].message : err));
        }
    };
    React.useEffect(() => {
        const scheduler = setInterval(async () => {
            const token = await getToken();
            setSessionToken(token);
        }, 1000);
        return () => clearInterval(scheduler);
    }, []);

    const [todos, setTodos] = React.useState([]);

    const getTodos = async () => {
        try {
            axios.get("https://api.rainoto.com/todos")
                .then(function (response) {
                    // take away the [ ] from the response.data
                    setTodos(response.data);
            });
        }
        catch (err) {
            log("Error:> " + (err.errors ? err.errors[0].message : err));
        }
    };

    React.useEffect(() => {
        getTodos();
    }, [])

    const [body, setBody] = React.useState("")
    const [completed, setCompleted] = React.useState("false")
    const [dateBy, setDateBy] = React.useState("")
    const date = new Date().toISOString().slice(0, 10)
    const [pet, setPet] = React.useState("Fire")
    const [open, setOpen] = React.useState(false)

    const traitList = [
        "Cute",
        "Loyal",
        "Lazy",
        "Playful",
        "Friendly",
        "Curious",
        "Lonely",
        "Loud",
        "Quiet",
        "Silly",
        "Sleepy",
    ]
    const trait = traitList[Math.floor(Math.random() * traitList.length)]

    const postData = async (event) => {
        event.preventDefault()
        const res = await fetch(
          'https://api.rainoto.com/todos',
          {
            body: JSON.stringify({
              username,
              body,
              completed,
              dateBy,
              date,
              pet,
              trait
            }),
            headers: {
              'Content-Type': 'application/json',
            },
            method: 'POST',
          }
        )
        const result = await res;
        getTodos();
      }
    

    return (
        <ScrollView style={styles.list}>
            <TouchableOpacity style={styles.link} onPress={onSignOutPress}>
                <Text style={styles.linkText}>Sign out</Text>
            </TouchableOpacity>

            <TextInput
                style={styles.input}
                placeholder="Body"
                onChangeText={setBody}
                value={body}
            />
            <DatePicker
                value={dateBy}
                onChange={(value) => setDateBy(value)}
                format="yyyy-mm-dd"
                endYear={2030}
                startYear={2022}
                height={100}
                fadeColor="#F2F2F2"
                fontSize={16}
            />
            {/* Pet dropdown menu */}
            <TextInput
                style={styles.input}
                placeholder="Pet"
                onChangeText={setPet}
                value={pet}
            />

            {/* Submit */}
            <TouchableOpacity
                style={styles.button}
                onPress={postData}
            >
                <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>

            <Text>
            Tip: the pet will become available when you complete the todo, if you dont complete the todo on time the pet will be lost forever!
            </Text>

            {
                todos.map((todo, index) => {
                    if(todo.username == username ) {
                        if(todo.completed == "false") {
                            return (
                                <View key={index} style={styles.todo}>
                                    <Text style={styles.todoText}>{todo.body}</Text>
                                    <TouchableOpacity style={styles.link} onPress={() => {
                                        axios.put("https://api.rainoto.com/todos/" + todo._id, {
                                            completed: "true"
                                        })
                                        .then(function (response) {
                                            // take away the [ ] from the response.data
                                            getTodos();
                                        });
                                    }
                                    }>
                                        <Text style={styles.linkText}>Complete</Text>
                                    </TouchableOpacity>
                                </View>
                            )
                        }
                    }
                })
            }
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
    },
    todo: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
    },
    link: {
        marginTop: 20,
    },
    list: {
        marginTop: 20, 
        marginBottom: 20,  
    },
    linkText: {
        color: "#2e78b7",
        fontSize: 14,
    },
});