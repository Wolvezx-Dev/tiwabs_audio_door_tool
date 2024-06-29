import {
  Text,
  Paper,
  Center,
  Space,
  TextInput,
  Button,
  Select,
  Modal,
  Group,
  SimpleGrid,
  ScrollArea,
  Card,
  Title,
  ActionIcon,
  Tabs,
} from "@mantine/core";
import { showNotification, NotificationsProvider } from "@mantine/notifications";
import { useEffect, useState } from "react";
import { BiError } from "react-icons/bi";
import { ImBin, ImPencil } from "react-icons/im";

let doorValue: any[] = [];
let soundSet: string;
let Params: string;
let value: number;

export function Home() {
  const [config, setConfig] = useState<any>([]);
  const [render, setRender] = useState<number>(0);
  const [newOpened, setNewOpened] = useState(false);
  const [editOpened, setEditOpened] = useState(false);
  const [HashToConvert, setHashToConvert] = useState<string>('');
  const [convertedHash, setConvertedHash] = useState<string>('');
  const [availableDoorSound, setAvailableDoorSound] = useState([]);
  const [selectedDoorSound, setSelectedDoorSound] = useState<string | null>("");
  const [editIndex, setEditIndex] = useState<number | null>(null);

  useEffect(() => {
    window.Main.on('Loaded', (receiveConfig: any) => {
      setConfig(receiveConfig);
      sendAvailableDoorSounds(receiveConfig.availableDoorSound);
    });

    window.Main.on('xmlData', (data: any) => {
      xmlDataToArray(data['Dat151']['Items']);
    });
  }, []);

  function getHash(key: string) {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    const hashedStr = hash.toString(16).padStart(8, '0');
    setConvertedHash(hashedStr);
    return hashedStr;
  }

  function arrayFindValue() {
    const item = config.availableDoorSound.find((item: any) => item.name === selectedDoorSound);
    if (item) {
      soundSet = item.soundSet;
      Params = item.Params;
      value = item.value;
    }
  }

  function arrayFindExisting(findThisValue: string) {
    return doorValue.some((item: any) => item.doorName === findThisValue);
  }

  function xmlDataToArray(xml: any) {
    xml[0].Item.forEach((item: any) => {
      if (item.$.type === "Door") {
        const doorName = item.Name[0];
        const doorHash = getHash(doorName);
        const soundSet = item.SoundSet[0];
        const Params = item.Params[0];
        const value = item.Unk1[0].$.value;
        const newItem = { doorName, doorHash, soundSet, Params, value };
        doorValue.push(newItem);
        setRender(Math.random());
      }
    });
  }

  function sendAvailableDoorSounds(availableDoorSound: any) {
    const initAvailableDoorSound = availableDoorSound.map((item: any) => ({
      value: item.name,
      label: item.name,
    }));
    setAvailableDoorSound(initAvailableDoorSound);
  }

  const deleteCard = (index: number) => {
    doorValue.splice(index, 1);
    setRender(Math.random());
  };

  const doorsCard = () => {
    return doorValue.map((door, index) => (
      <Card
        key={index + 1}
        sx={{
          backgroundColor: "#2A2A2A",
          color: "white",
          borderRadius: "8px",
          marginBottom: "10px",
          padding: "15px"
        }}
      >
        <Group position="apart">
          <Title sx={{ fontSize: 20, color: "#FFD700" }}>#{index + 1} | {door.doorName}</Title>
          <Group>
            <ActionIcon onClick={() => { setEditIndex(index); setEditOpened(true); }}><ImPencil color={"#1E90FF"} /></ActionIcon>
            <ActionIcon onClick={() => deleteCard(index)}><ImBin color={"#FF6347"} /></ActionIcon>
          </Group>
        </Group>
        <Text>Door hash: hash_{door.doorHash}</Text>
        <Text>Door sound hash: {door.soundSet}</Text>
        <Text>Door sound params: {door.Params}</Text>
        <Text>Door sound value: {door.value}</Text>
      </Card>
    ));
  };

  return (
    <NotificationsProvider>
      <Modal
        opened={newOpened}
        onClose={() => setNewOpened(false)}
        closeOnClickOutside={false}
        title="Generate sound for a new door"
        overlayColor="rgba(0, 0, 0, 0.6)"
        overlayBlur={3}
      >
        <TextInput
          placeholder="Enter the door name"
          value={HashToConvert}
          onChange={(event) => {
            setHashToConvert(event.currentTarget.value);
            getHash(event.currentTarget.value);
          }}
        />
        <Space h="md" />
        <Select
          placeholder="Select the door sound"
          clearable
          value={selectedDoorSound}
          onChange={setSelectedDoorSound}
          data={availableDoorSound}
        />
        <Space h="md" />
        <Button
          variant="outline"
          color={'blue'}
          onClick={() => {
            arrayFindValue();
            if (!arrayFindExisting(HashToConvert)) {
              const insertData = { doorName: HashToConvert, doorHash: getHash(HashToConvert), soundSet, Params, value };
              doorValue.push(insertData);
              setRender(Math.random());
            } else {
              showNotification({
                autoClose: 2500,
                title: "Error",
                message: "This door already exists",
                color: "red",
                icon: <BiError />,
              });
            }
          }}
        >
          Add a door
        </Button>
        <Space h="md" />
        <Text sx={{ fontSize: "15px", color: "white" }}>
          Converted Hash: {convertedHash ? convertedHash : "undefined"} | Door sound: {selectedDoorSound ? selectedDoorSound : "undefined"}
        </Text>
      </Modal>

      <Modal
        opened={editOpened}
        onClose={() => setEditOpened(false)}
        closeOnClickOutside={false}
        title="Edit Sound of the door"
        overlayColor="rgba(0, 0, 0, 0.6)"
        overlayBlur={3}
      >
        <Select
          placeholder="Select the door sound"
          clearable
          value={selectedDoorSound}
          onChange={setSelectedDoorSound}
          data={availableDoorSound}
        />
        <Button
          variant="outline"
          color={'blue'}
          onClick={() => {
            if (editIndex !== null) {
              arrayFindValue();
              const newData = { doorName: doorValue[editIndex].doorName, doorHash: doorValue[editIndex].doorHash, soundSet, Params, value };
              doorValue[editIndex] = newData;
              setRender(Math.random());
              setEditOpened(false);
            }
          }}
        >
          Save Change
        </Button>
      </Modal>

      <Paper
        sx={{
          width: 550,
          height: 820,
          backgroundColor: "rgba(37, 37, 37, 0.8)",
          padding: "20px",
          borderRadius: "10px",
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between', // Space content evenly
        }}
      >
        <Tabs>
          <Tabs.List>
            <Tabs.Tab value="home">Home</Tabs.Tab>
            <Tabs.Tab value="settings">Settings</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="home" pt="xs">
            <SimpleGrid cols={1} verticalSpacing="xs">
              <Group grow>
                <Group grow>
                  <Button variant="outline" color={'blue'} onClick={() => { window.Main.sendMessage('openFile'); }}>Import file</Button>
                  <Button variant="outline" color={'blue'} onClick={() => { setNewOpened(true) }}>Add a new door</Button>
                </Group>
              </Group>
            </SimpleGrid>
            <ScrollArea style={{ height: 'calc(100% - 60px)', padding: "10px" }}>
              {doorsCard()}
            </ScrollArea>
            <Group grow>
              <Button
                variant="outline"
                color={"blue"}
                onClick={() => {
                  if (doorValue.length < 1) {
                    showNotification({
                      autoClose: 2500,
                      title: "Error",
                      message: "You need to add a door before generating a file",
                      color: "red",
                      icon: <BiError />,
                    });
                  } else {
                    window.Main.sendMessage('generate', doorValue);
                  }
                }}
              >
                Generate Audio File
              </Button>
            </Group>
          </Tabs.Panel>
        </Tabs>
        <Center sx={{ marginTop: 'auto', paddingTop: '20px' }}>
          <Text>Created by Tiwabs edited by wolvezx</Text>
        </Center>
      </Paper>
    </NotificationsProvider>
  );
}
