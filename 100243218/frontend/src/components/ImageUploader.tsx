import React, { ChangeEvent, useState } from 'react';
import { Row, Col } from 'antd';
import { Upload, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { UploadChangeParam, UploadFile } from 'antd/es/upload';


const ImageUploader: React.FC = () => {
    const [base64Image, setBase64Image] = useState<string | null>(null);
    
    const handleImageChange = async (info: any) => {
        console.log(info)
        if (info.file.status === 'done') {
            console.log(info)
            console.log('File uploaded successfully');
            const base64String = await convertImageToBase64(info.file.originFileObj);
            setBase64Image(base64String);
        } else if (info.file.status === 'error') {
            console.error('File upload failed');
        }
    };

    const handleUpload = async (info:any) => {
        if (info.file.status === 'done') {
            console.log('File uploaded successfully');
            // 获取上传的文件对象
            const file = info.file.originFileObj;
            try {
                // 转换图片为Base64编码
                const base64String = await convertImageToBase64(file);
                console.log('Base64 representation of the image:', base64String);
                // 在这里可以处理Base64编码的图片
            } catch (error) {
                console.error("Error converting image to Base64:", error);
            }
        } else if (info.file.status === 'error') {
            console.error('File upload failed');
            // 在这里可以处理上传失败后的逻辑
        }
    };
    

    const convertImageToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64String = reader.result?.toString();
                if (base64String) {
                    resolve(base64String);
                } else {
                    reject(new Error("Failed to convert image to Base64"));
                }
            };
            reader.onerror = (error) => {
                reject(error);
            };
            reader.readAsDataURL(file);
        });
    };

    return (
        // <div>
        //     <Row justify="center" align="middle" style={{ minHeight: '10vh' }}>
        //         <Col>
        //         <input type="file" onChange={handleImageChange} accept="image/*" />
        //         </Col>
        //     </Row>

        //     {base64Image && (
        //         <div>
        //             <img src={base64Image} alt="Uploaded" style={{ maxWidth: '100%' }} />
        //             {/* <p>Base64 Representation:</p>
        //             <textarea value={base64Image} readOnly rows={10} style={{ width: '100%' }} /> */}
        //         </div>
        //     )}
        // </div>
        <div style={{ width: '200px', height: '200px', border: '1px solid #ccc', position: 'relative' }}>
            <Upload
                showUploadList={false}
                onChange={handleImageChange}
                beforeUpload={(file) => false} // 禁止自动上传
            >
                <Button icon={<UploadOutlined />} style={{ width: '100%', height: '100%' }}>
                    点击上传图片
                </Button>
            </Upload>
        </div>

        // <div style={{ width: '200px', height: '200px', border: '1px solid #ccc', position: 'relative' }}>
        //     {/* Ant Design Upload 组件 */}
        //     <Upload
        //         showUploadList={false}
        //         action="/api/upload" // 替换为你的上传地址
        //         onChange={handleUpload}
        //         beforeUpload={(file) => {
        //             // 判断文件的大小，太大的话就不能上传
        //             return true;
        //         }}
        //     >
        //         <Button icon={<UploadOutlined />} style={{ width: '100%', height: '100%' }}>
        //             点击上传图片
        //         </Button>
        //     </Upload>
        // </div>

    );
};

export default ImageUploader;
