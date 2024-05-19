import { create } from 'zustand';
import axios from 'axios';
import { api } from '../config/config';

interface WorkSpaceData {
  workSpaceName?: string | null;
  ownerEmail?: string | null;
  emailTemplates?: string[] | null;
  ownerId?: string | null;
  pfp_url?: string | null;
}

interface UserData {
  email?: string | null;
  tag?: string | null;
  name?: string | null;
  pfp_url?: string | null;
  phone?: string | null;
}

interface WorkSpaceState {
  workSpaceData: WorkSpaceData | null;
  error: any;
  users: UserData[] | null;
  axiosPrivate: any;
  setAxiosPrivate: any;
  checkName: (workSpaceData: WorkSpaceData) => Promise<void>;
  addWorkSpace: (workSpaceData: WorkSpaceData) => Promise<void>;
  setWorkSpaceData: (workSpaceData: WorkSpaceData) => void;
  getWorkspaceData: () => Promise<void>;
  getWorkspaceUsers: () => Promise<void>;
  updateAvatar: (workSpaceData: WorkSpaceData) => Promise<void>;
}

const useWorkSpaceStore = create<WorkSpaceState>((set, get) => ({
  workSpaceData: null,
  users: null,
  axiosPrivate: null,
  error: null,

  setWorkSpaceData: (workSpaceData: WorkSpaceData) => {
    set({ workSpaceData });
  },

  setAxiosPrivate: async (axiosPrivate: any) => {
    set({ axiosPrivate });
  },

  addWorkSpace: async (workSpaceData: WorkSpaceData) => {
    try {
      await axios.post(`${api.url}/workspace/add-workspace`, workSpaceData);
      set({ error: null });
    } catch (err: any) {
      const error =
        err.response?.data?.message ||
        err.message ||
        'An unknown error occurred';
      set({ error });
      throw error;
    }
  },

  checkName: async (workSpaceData: WorkSpaceData) => {
    try {
      await axios.post(
        `${api.url}/workspace/check-name`,
        workSpaceData
      );
      set({ error: null });
    } catch (err: any) {
      const error =
        err.response?.data?.error || err.message || 'An unknown error occurred';
      set({ error });
      throw error;
    }
  },

  updateAvatar: async (workSpaceData: WorkSpaceData) => {
    try {
      const { axiosPrivate } = get();
      await axiosPrivate?.post(
        `${api.url}/wusers/update-workspace-avatar`,
        workSpaceData
      );
      set({ error: null });
    } catch (err: any) {
      const error =
        err.response?.data?.error || err.message || 'An unknown error occurred';
      set({ error });
      throw error;
    }
  },
  getWorkspaceData: async () => {
    try {
      const { axiosPrivate } = get();
      const response = await axiosPrivate?.get(
        `${api.url}/wusers/get-workspace-data`
      );

      set({ workSpaceData: response.data, error: null });
    } catch (err: any) {
      const error =
        err.response?.data?.error || err.message || 'An unknown error occurred';
      set({ error });
      throw error;
    }
  },

  getWorkspaceUsers: async () => {
    try {
      const { axiosPrivate } = get();
      const response = await axiosPrivate?.get(
        `${api.url}/wusers/get-workspace-users`
      );
      set({ users: response.data, error: null });
    } catch (err: any) {
      const error =
        err.response?.data?.error || err.message || 'An unknown error occurred';
      set({ error });
      throw error;
    }
  },
}));

export default useWorkSpaceStore;
