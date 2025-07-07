/* eslint-disable no-console */
import { CircleX, Loader2, Trash2, Upload } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import { File as UploadedFile, deleteFile, uploadFile, viewFile } from './public.api';

import { Button } from '@/components/ui/button';
import { Media, MediaType } from './media';


export interface UploadAndViewFileProps {
    media?: Media | Media[] | null;
    onMediaChange?: (media: Media | Media[] | null) => void;
    allowTypes?: string;
    maxFileSize?: number;
    initialButton?: ReactNode;
    fileInputId?: string;
    multiple?: boolean;
    readOnly?: boolean;
}

export default function UploadAndViewFile({
    media,
    onMediaChange,
    allowTypes = MediaType.ALL,
    maxFileSize: maxfileSize = 5 * 1024 * 1024, // 5MB default
    initialButton,
    fileInputId = 'file-upload',
    multiple = false,
    readOnly = false,
}: UploadAndViewFileProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingFileIndex, setLoadingIndex] = useState<number | null>(null);
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

    // initialize from media prop
    useEffect(() => {
        if (!media) {
            setUploadedFiles([]);
        } else if (Array.isArray(media)) {
            // handle array of media
            const files = media
                .map((m) => ({
                    url: m.url,
                    filename: m.fileName,
                    message: '',
                }))
                .filter((f) => f.url);
            setUploadedFiles(files as UploadedFile[]);
        } else if (media.url) {
            // handle single media
            setUploadedFiles([
                {
                    url: media.url,
                    filename: media.fileName || '',
                    message: '',
                },
            ]);
        }
    }, []);

    // sync with parent media prop when it changes
    useEffect(() => {
        if (!media) {
            setUploadedFiles([]);
        } else if (Array.isArray(media) && multiple) {
            const newFiles = media
                .filter((m) => m.url)
                .map((m) => ({
                    url: m.url,
                    filename: m.fileName || '',
                    message: '',
                }));

            // only update if there is a change
            if (JSON.stringify(newFiles) !== JSON.stringify(uploadedFiles)) {
                setUploadedFiles(newFiles as UploadedFile[]);
            }
        } else if (!Array.isArray(media) && media.url) {
            // handle single media
            const newFiles = [
                {
                    url: media.url,
                    filename: media.fileName || '',
                    message: '',
                },
            ];

            // only update if there is a change
            if (JSON.stringify(newFiles) !== JSON.stringify(uploadedFiles)) {
                setUploadedFiles(newFiles as UploadedFile[]);
            }
        }
    }, [media]);

    // handle file change
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const { files } = e.target;
        if (!files || files.length === 0) return;

        setIsLoading(true);

        try {
            const uploadedMediaList: Media[] = [];
            // Dùng biến tạm để gom các file mới upload
            const newUploadedFiles: UploadedFile[] = [];

            for (let i = 0; i < files.length; i += 1) {
                const file = files[i];
                // check file size
                if (maxfileSize && file?.size && file.size > maxfileSize) {
                    toast.error(
                        `File ${file?.name} vượt quá khích thước tối đa ${maxfileSize / 1024 / 1024}MB`
                    );
                    continue;
                }

                // check file type
                if (
                    !MediaType.ALL.includes(file?.type as MediaType) &&
                    !allowTypes.includes(file?.type as MediaType)
                ) {
                    toast.error(`File ${file?.name} type not supported. Allowed types: ${allowTypes}`);
                    continue;
                }

                // create form data object to send file to server
                const formData = new FormData();
                formData.append('file', file as File);

                // upload file
                // eslint-disable-next-line no-await-in-loop
                const response = await uploadFile(formData);

                // create media object
                const newMedia: Media = {
                    type: file?.type as MediaType,
                    url: response.url,
                    fileName: response.filename,
                };

                uploadedMediaList.push(newMedia);
                newUploadedFiles.push(response);
            }

            // Cập nhật state dựa trên giá trị hiện tại nhất
            setUploadedFiles(prevFiles => {
                let updatedFiles;
                if (multiple) {
                    updatedFiles = [...prevFiles, ...newUploadedFiles];
                } else {
                    updatedFiles = newUploadedFiles.slice(-1);
                }
                // Gọi onMediaChange với media mới nhất
                if (onMediaChange) {
                    if (multiple) {
                        const allMedia = updatedFiles.map(f => ({
                            url: f.url,
                            fileName: f.filename,
                        }));
                        onMediaChange(allMedia);
                    } else {
                        const lastMedia = updatedFiles[0]
                            ? {
                                url: updatedFiles[0].url,
                                fileName: updatedFiles[0].filename,
                            }
                            : null;
                        onMediaChange(lastMedia);
                    }
                }
                return updatedFiles;
            });

            if (uploadedMediaList.length > 0) {
                toast.success(
                    uploadedMediaList.length > 1
                        ? `${uploadedMediaList.length} files uploaded successfully`
                        : 'File uploaded successfully'
                );
            }
        } catch (error) {
            toast.error('Lỗi khi tải lên tệp');
        } finally {
            setIsLoading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleFileView = async (url: string, index: number) => {
        if (!url) return;
        setLoadingIndex(index);
        try {
            const fileUrl = await viewFile(url);
            // open file in new tab
            if (fileUrl) {
                // create anchor element
                const link = document.createElement('a');
                link.href = fileUrl;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';

                // append to document, click it, and remove it
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                toast.error('Lỗi khi xem tệp');
            }
        } catch (error) {
            toast.error('Lỗi khi xem tệp');
        } finally {
            setLoadingIndex(null);
        }
    };

    const handleFileRemove = async (url: string, index: number) => {
        if (readOnly) return;
        if (!url) return;

        setLoadingIndex(index);
        try {
            await deleteFile(url);

            // remove file from uploaded files
            const newFiles = [...uploadedFiles];
            newFiles.splice(index, 1);
            setUploadedFiles(newFiles);

            if (onMediaChange) {
                if (multiple) {
                    // Use newFiles instead of uploadedFiles to get the updated array
                    const remainingMedia = newFiles.map(file => ({
                        url: file.url,
                        fileName: file.filename
                    }));
                    onMediaChange(remainingMedia.length > 0 ? remainingMedia : []);
                } else {
                    // Use newFiles[0] instead of uploadedFiles[0]
                    const remainingFile = newFiles[0];
                    if (remainingFile) {
                        const media: Media = {
                            url: remainingFile.url,
                            fileName: remainingFile.filename
                        };
                        onMediaChange(media);
                    } else {
                        onMediaChange([]);
                    }
                }
            }
        } catch (error) {
            toast.error('Lỗi khi xóa tệp');
        } finally {
            setLoadingIndex(null);
        }
    };

    const handleDeleteAllFiles = async () => {
        if (readOnly) return;
        if (uploadedFiles.length === 0) return;

        setIsLoading(true);
        try {
            // Delete each file one by one
            for (const file of uploadedFiles) {
                if (file.url) {
                    // eslint-disable-next-line no-await-in-loop
                    await deleteFile(file.url);
                }
            }

            // Clear the files list
            setUploadedFiles([]);

            // Update parent component
            if (onMediaChange) {
                onMediaChange([]);
            }

            toast.success('Tất cả tệp đã được xóa thành công');
        } catch (error) {
            toast.error('Lỗi khi xóa tất cả tệp');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="flex flex-col gap-4">
            <input
                type="file"
                id={fileInputId}
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                multiple={multiple}
                accept={allowTypes}
                disabled={readOnly}
            />

            {uploadedFiles.length > 0 ? (
                <div className="flex flex-col gap-2">
                    <div className="relative flex flex-row items-center justify-between gap-5">
                        {multiple && !readOnly && (
                            <>
                                <button
                                    type="button"
                                    onClick={handleUploadClick}
                                    disabled={isLoading}
                                    className="flex items-center justify-center gap-2 rounded-md border border-gray-300 px-4 py-2 transition-colors hover:bg-gray-50"
                                >
                                    {isLoading ? (
                                        <Loader2 className="size-4 animate-spin" />
                                    ) : (
                                        <Upload className="size-4" />
                                    )}
                                    <span className="text-gray-700">
                                        {isLoading ? 'Đang tải lên...' : 'Thêm tệp'}
                                    </span>
                                </button>

                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleDeleteAllFiles}
                                    disabled={isLoading}
                                    className="flex items-center gap-1"
                                >
                                    {isLoading ? (
                                        <Loader2 className="size-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="size-4" />
                                    )}
                                    <span>Xóa tất cả</span>
                                </Button>
                            </>
                        )}
                    </div>
                    {uploadedFiles.map((file, index) => (
                        <div key={file.url} className="flex items-center py-1">
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="link"
                                    className="text-red-500 hover:cursor-pointer hover:underline"
                                    onClick={() => handleFileView(file.url, index)}
                                >
                                    {file.filename}
                                </Button>
                            </div>
                            {!readOnly && (
                                <div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleFileRemove(file.url, index)}
                                        disabled={loadingFileIndex === index}
                                    >
                                        {loadingFileIndex === index ? (
                                            <Loader2 className="mr-1 size-4 animate-spin" />
                                        ) : (
                                            <CircleX className="size-4 hover:text-red-600" />
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                !readOnly && (
                    <div className="relative flex size-fit flex-row items-center gap-5 rounded-[12px] border ">
                        {initialButton || (
                            <button
                                type="button"
                                onClick={handleUploadClick}
                                disabled={isLoading}
                                className="flex w-full max-w-xs items-center justify-center gap-2 rounded-md border border-gray-300 px-4 py-2 transition-colors hover:bg-gray-50"
                            >
                                {isLoading ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : (
                                    <Upload className="size-4" />
                                )}
                                <span className="text-gray-700">
                                    {/* eslint-disable-next-line no-nested-ternary */}
                                    {isLoading ? 'Đang tải lên...' : multiple ? 'Chọn các tệp' : 'Chọn tệp'}
                                </span>
                            </button>
                        )}
                    </div>
                )
            )}
        </div>
    );
}
