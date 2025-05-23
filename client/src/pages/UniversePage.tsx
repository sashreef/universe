import useMessengerStore from '../store/messenger';
import { Cottage, Bookmark, Add } from '@mui/icons-material';
import TextEditor from '../components/TextEditor';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import {
  Box,
  Flex,
  Button,
  Text,
  Image,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  HStack,
  Menu,
  MenuButton,
  MenuList,
} from '@chakra-ui/react';
import UserProfile from '../components/UserProfile';
import { useEffect, useState } from 'react';
import orgImage from '../../public/org-placeholder.png';
import useAuthStore from '../store/auth';
import { useNavigate } from 'react-router-dom';
import useUserStore from '../store/user';
import MessagesContainer from '../components/MessagesContainer';
import ChannelMembersModal from '../components/ChannelMembersModal';
import useWorkSpaceStore from '../store/workSpace';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import DeleteChannelModal from '../components/DeleteChannelModal';

const MainContent = (): JSX.Element => {
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    ownerId: '',
    workSpaceName: '',
    pfp_url: '',
  });
  const navigate = useNavigate();
  const {
    socket,
    currentChannel,
    notesChannel,
    channelGroups,
    channels,
    connectSocket,
    getChannelGroups,
    proccessUploadingAttachments,
    sendMessage,
    setCurrentChannel,
    recieveMessage,
    onUserJoinedChannel,
    onUserLeftChannel,
    onDeletedChannel,
    onDeletedMessage,
    onEditedMessage,
    onChannelRenamed,
  } = useMessengerStore(state => state);

  const { userData, logout, setUserData } = useAuthStore(state => state);
  const { getWorkspaceData, workSpaceData, updateAvatar } = useWorkSpaceStore(
    state => state
  );
  const axiosPrivate = useAxiosPrivate();
  const { setAxiosPrivate } = useUserStore(state => state);
  const [isReadonly, setIsReadonly] = useState<boolean>();

  const handleLogout = async (): Promise<void> => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log in:', error);
    }
  };

  useEffect(() => {
    connectSocket();
    getChannelGroups();
    recieveMessage();
    if (userData?.userId) {
      onUserJoinedChannel(userData.userId);
      onUserLeftChannel();
      onDeletedChannel();
      onDeletedMessage();
      onEditedMessage();
      onChannelRenamed();
    }

    return () => {
      setUserData({});
      socket?.removeAllListeners();
      socket?.disconnect();
    };
  }, []);

  useEffect(() => {
    const channel = channels?.find(
      channel => channel?.id === currentChannel?.id
    );

    if (channel) {
      const { ownerId, readonly } = channel;
      setIsReadonly(ownerId !== userData?.userId && readonly);
    }
  }, [currentChannel, channels, userData]);

  useEffect(() => {
    getWorkspaceData();
  }, [formData]);

  const { isOpen, onOpen, onClose } = useDisclosure({
    onClose: () => {
      setFormData({
        ownerId: '',
        workSpaceName: '',
        pfp_url: '',
      });
    },
  });

  const { fetchUserById, isUserProfileVisible, setIsUserProfileVisible } =
    useUserStore(state => state);

  const handleOpenModal = (): void => {
    if (userData?.userRole?.includes('administration')) {
      setError('');
      if (workSpaceData) {
        setFormData({
          ownerId: workSpaceData.ownerId ?? '',
          workSpaceName: workSpaceData.workSpaceName ?? '',
          pfp_url: workSpaceData.pfp_url ?? '',
        });
      }
      onOpen();
    }
  };
  const handleInputChange = (e: any): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleSave = async (): Promise<void> => {
    try {
      await updateAvatar(formData);
      onClose();
    } catch (error: any) {
      console.error(error);
      setError(error?.response?.data?.message || 'Failed to update user info');
    }
  };

  const openProfileOnClick = async (userId?: string): Promise<void> => {
    await setAxiosPrivate(axiosPrivate);
    if (userId) await fetchUserById(userId);
    setIsUserProfileVisible(true);
  };

  const openCurrentUserProfile = async (): Promise<void> => {
    await fetchUserById(userData?.userId ?? '');
    setIsUserProfileVisible(true);
  };

  const handleClickHome = (): void => {
    setCurrentChannel(
      channelGroups[0].items[0].id,
      channelGroups[0].items[0].name
    );
  };

  const openNotes = (): void => {
    setCurrentChannel(notesChannel.id, notesChannel.name);
  };

  const handleSendMessage = async (message: any): Promise<void> => {
    const filesData = await proccessUploadingAttachments(
      axiosPrivate,
      message.attachments
    );
    sendMessage(filesData, message);
  };

  return (
    <Flex flexDirection={'column'} alignItems={'center'} overflow={'hidden'}>
      <Header />
      <Flex>
        <Flex
          w="70px"
          flexDirection={'column'}
          alignItems={'center'}
          justifyContent={'space-between'}
          color={'zinc300'}
        >
          <Flex pt="15px" pl="4px" flexDirection={'column'} gap="10px">
            <Button
              p="1"
              color={'zinc300'}
              bg="transparent"
              _hover={{ background: 'transparent' }}
              _active={{ background: 'transparent' }}
              onClick={handleOpenModal}
            >
              <Image
                w="50px"
                h="50px"
                src={workSpaceData?.pfp_url ?? orgImage}
                alt="Organization banner"
                alignSelf="center"
                borderRadius="10px"
              />
            </Button>
            <Flex
              mt="20px"
              flexDirection={'column'}
              justifyContent={'center'}
              alignItems={'center'}
            >
              <Button
                p="1"
                color={'zinc300'}
                bg={`${currentChannel && currentChannel.id !== notesChannel.id ? 'rgba(0, 0, 0, 0.3)' : 'transparent'}`}
                _hover={{ background: 'rgba(0, 0, 0, 0.2)' }}
                _active={{ background: 'rgba(0, 0, 0, 0.2)' }}
                onClick={handleClickHome}
              >
                <Cottage fontSize="medium" />
              </Button>
              <Text fontSize={'xs'}>Home</Text>
            </Flex>
            <Flex
              flexDirection={'column'}
              justifyContent={'center'}
              alignItems={'center'}
            >
              <Button
                p="1"
                color={'zinc300'}
                bg={`${currentChannel?.id === notesChannel.id ? 'rgba(0, 0, 0, 0.3)' : 'transparent'}`}
                _hover={{ background: 'rgba(0, 0, 0, 0.2)' }}
                _active={{ background: 'rgba(0, 0, 0, 0.2)' }}
                onClick={openNotes}
              >
                <Bookmark fontSize="medium" />
              </Button>
              <Text fontSize={'xs'}>Notes</Text>
            </Flex>
          </Flex>
          <Flex pb="15px" pl="4px" flexDirection={'column'} gap="10px">
            <Button
              padding={'1px'}
              color={'zinc300'}
              background={'rgba(0,0,0,0.3)'}
              _hover={{ background: 'rgba(0, 0, 0, 0.4)' }}
              _active={{ background: 'rgba(0, 0, 0, 0.4)' }}
              onClick={() => {
                handleLogout();
              }}
            >
              <Add fontSize="medium" />
            </Button>
            <Button
              p="1px"
              color={'zinc300'}
              bg="rgba(33,35,38,1)"
              _hover={{ background: 'rgba(0, 0, 0, 0)' }}
              _active={{ background: 'rgba(0, 0, 0, 0)' }}
              onClick={() => {
                openCurrentUserProfile();
              }}
            >
              <Image
                w="50px"
                h="50px"
                src={
                  userData?.pfp_url
                    ? userData.pfp_url
                    : 'https://i.imgur.com/zPKzLoe.gif'
                }
                alt="Profile banner"
                alignSelf="center"
                borderRadius="10px"
              />
            </Button>
          </Flex>
        </Flex>
        <Box
          flexDirection="column"
          w="calc(100vw - 78px)"
          m="1"
          borderRadius="10px"
          overflow="hidden"
        >
          <Flex>
            <Sidebar />
            <Box color="zinc300" flex="6">
              <Flex
                fontSize="lg"
                width="100%"
                background="rgba(0, 0, 0, 0.5)"
                borderBottom="1px"
                borderColor="rgba(29, 29, 32, 1)"
                p="15px"
                h="60px"
                alignItems="center"
                justifyContent="space-between"
              >
                {!currentChannel?.user?._id &&
                currentChannel?.id !== notesChannel.id ? (
                  <>
                    <Text
                      overflow="hidden"
                      textOverflow="ellipsis"
                      whiteSpace="nowrap"
                      fontWeight={'bold'}
                      maxW={'calc(100vw - 1000px)'}
                    >
                      #{currentChannel?.name}
                    </Text>
                    <HStack>
                      <ChannelMembersModal />
                      <Menu placement="bottom-end">
                        <MenuButton
                          as={Button}
                          color="zinc300"
                          bg="transparent"
                          _active={{ background: 'rgba(0, 0, 0, 0.4)' }}
                          _hover={{ background: 'rgba(0, 0, 0, 0.4)' }}
                        >
                          ⋮
                        </MenuButton>
                        <MenuList bg="zinc800" border="none" minWidth="auto">
                          <DeleteChannelModal />
                        </MenuList>
                      </Menu>
                    </HStack>
                  </>
                ) : (
                  <HStack
                    alignContent={'start'}
                    justifyContent="flex-start"
                    width="100%"
                  >
                    <Button
                      fontWeight={'bold'}
                      fontSize={'lg'}
                      color="zinc300"
                      bg="transparent"
                      _active={{ background: 'rgba(0, 0, 0, 0.4)' }}
                      _hover={{ background: 'rgba(0, 0, 0, 0.1)' }}
                      padding={'0'}
                      onClick={() => {
                        openProfileOnClick(currentChannel?.user?._id);
                      }}
                    >
                      {currentChannel?.id === notesChannel.id && (
                        <Bookmark fontSize="small" />
                      )}
                      {currentChannel && `${currentChannel?.name}`}
                    </Button>
                  </HStack>
                )}
              </Flex>
              <Flex
                maxH={
                  isReadonly ? 'calc(100vh - 102px)' : 'calc(100vh - 270px)'
                }
                h={'100%'}
                background="rgba(0, 0, 0, 0.5)"
                bgImage="../../chat-bg-pattern-dark.png"
                bgSize="cover"
                bgRepeat="no-repeat"
                bgPosition="center"
              >
                <MessagesContainer />
              </Flex>
              {!isReadonly && (
                <Flex maxH={'168px'} h={'100%'} background="rgba(0, 0, 0, 0.5)">
                  <TextEditor sendMessage={handleSendMessage} />
                </Flex>
              )}
            </Box>
            {isUserProfileVisible && <UserProfile />}
          </Flex>
        </Box>
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent bg="zinc900" color="zinc200">
            <ModalHeader>Edit workspace image</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <FormControl mt={4}>
                <FormLabel>Profile Picture URL</FormLabel>
                <Input
                  name="pfp_url"
                  value={formData.pfp_url}
                  onChange={handleInputChange}
                />
              </FormControl>
            </ModalBody>
            {error && (
              <Text ml="7" color="red.500">
                {error}
              </Text>
            )}
            <ModalFooter>
              <Button
                background="zinc700"
                _hover={{ background: 'zinc800' }}
                color="zinc300"
                mr={3}
                onClick={() => {
                  handleSave();
                }}
              >
                Save
              </Button>
              <Button onClick={onClose}>Cancel</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Flex>
    </Flex>
  );
};

export default MainContent;
