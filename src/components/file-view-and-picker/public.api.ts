import axios from "axios";

export interface File {
    url: string;
    filename: string;
    message: string;
}

export const uploadFile = async (file: File | FormData): Promise<File> => {
    let formData: FormData;

    if (file instanceof FormData) {
        formData = file;
    } else {
        // Convert File object to FormData if needed
        formData = new FormData();
        // This expects a browser File object, not our File interface
        // This branch is likely not used in the current implementation
        formData.append('file', file as any);
    }

    const response = await axios.post(
        'https://vsdp-api.development.thanhlp18.info/api/v1/file-storage/upload',
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }
    );
    return response.data.result;
};

export const viewFile = async (url: string) => {
    await axios.get(
        'https://vsdp-api.development.thanhlp18.info/api/v1/file-storage/view',
        {
            params: {
                url: url,
            },
        }
    );
    return `https://vsdp-api.development.thanhlp18.info/api/v1/file-storage/view?url=${url}`;
}

export const deleteFile = async (url: string) => {
    const response = await axios.delete(
        'https://vsdp-api.development.thanhlp18.info/api/v1/file-storage/delete',
        {
            params: {
                url: url,
            },
        }
    );
    return response.data.result;
}