import React, { useCallback, useState, useRef } from 'react';
import { backUrl } from '../config/config';
import { Descriptions, Form, Button, Input, Divider, Image, Space, notification, Popconfirm } from 'antd';
import useInput from '../hooks/useInput';
import { deleteItemAPI, registerItemAPI, updateItemAPI, uploadImageAPI } from '../apis/item';
import { CheckCircleOutlined } from '@ant-design/icons';
import Router from 'next/router';

const ItemEdit = ({ item, myUserInfo }) => {
  const [loading, setLoading] = useState(false);
  const [itemId, setItemId] = useState(item.id);
  const [codeName, onChangeCodeName] = useInput(item.codeName); // 제품 코드명 (사용자 비공개)
  const [name, onChangeName] = useInput(item.name); // 제품 이름
  const [packageName, onChangePack] = useInput(item.packageName); // 제품 포장 종류
  const [unit, onChangeUnit] = useInput(item.unit); // 제품 무게 단위
  const [msrp, setMsrp] = useState(item.msrp); // 권장소비가
  const [description, onChangeDesc] = useInput(item.description); // 권장소비가
  const [supplyPrice, setPrice] = useState(item.supplyPrice); // 실제 공급가  
  const [imagePath, setImagePath] = useState<string>(item.imgSrc); // 제품사진 업로드 경로

  const onChangeMsrp = useCallback( // 가격 유효성검사
    (e) => {
      const { value } = e.target;
      const onlyNumber = value.replace(/[^0-9]/g, '');
      // const regExpPhone = /[^0-9]/;
      setMsrp(onlyNumber);
      // setPhoneValidError(!regExpPhone.test(e.target.value));
    },
    [msrp],
  );
  const onChangePrice = useCallback( // 가격 유효성검사
    (e) => {
      const { value } = e.target;
      const onlyNumber = value.replace(/[^0-9]/g, '');
      // const regExpPhone = /[^0-9]/;
      setPrice(onlyNumber);
      // setPhoneValidError(!regExpPhone.test(e.target.value));
    },
    [supplyPrice],
  );


  const openNotification = (text) => {
    notification.open({
      message: `${text}`,
      description:
        ``,
      icon: <CheckCircleOutlined style={{ color: '#108ee9' }} />,
      duration: 2,
    });
  };

  // 제품사진 업로드
  const imageInput = useRef<HTMLInputElement>(null);
  const onClickImageUpload = useCallback(() => {
    imageInput.current?.click();
  }, []);
  const onChangeImage = useCallback((e) => {
    console.log('files[0]', e.target.files[0]);
    const fileName = e.target.files[0]?.name.split('.');
    const fileExt = fileName[fileName.length-1].toLowerCase();
    if (fileExt !== 'jpg' && fileExt !== 'png' && fileExt !== 'gif'){
      return alert('jpg, png, gif파일만 업로드 가능합니다.');
    }
    const imageFormData = new FormData();
    imageFormData.append('image', e.target.files[0])
    uploadImageAPI<string>(imageFormData).then((result) => {
      console.log('result', result);
      setImagePath(result);
      console.log('onChange imagePath', imagePath);
    });
  }, []);
  // 업로드한 사진 제거 (패스만 제거)
  const onRemoveImage = () => {
    setImagePath(null);
  };

  // 수정 완료
  const onEditSubmit = useCallback(() => {
    setLoading(true);
    const formData = new FormData();
    // data: { codeName: string, package: string, imgSrc: string|null, name: string, unit: string, msrp: string|null, supplyPrice: string|null }
    formData.append('itemId', itemId );
    formData.append('codeName', codeName);
    formData.append('name', name);
    formData.append('packageName', packageName);
    formData.append('unit', unit);
    formData.append('msrp', msrp);
    formData.append('supplyPrice', supplyPrice);
    formData.append('description', description);
    if (imagePath){
      formData.append('imgSrc', imagePath);
    }
    console.log('omSubmit imagePath', imagePath)
    updateItemAPI(formData)
    .then((data) => {
      openNotification('제품 수정이 완료되었습니다.');
    })
    .catch((error) => {
      alert(error.response.data);
    })
    .finally(() => {
      setLoading(false);
    });
  }, [codeName, name, packageName, unit, msrp, supplyPrice, imagePath, description]);

  // 복사생성
  const onCreateSubmit = useCallback(() => {
    setLoading(true);
    const formData = new FormData();
    // data: { codeName: string, package: string, imgSrc: string|null, name: string, unit: string, msrp: string|null, supplyPrice: string|null }
    formData.append('codeName', codeName);
    formData.append('name', name);
    formData.append('packageName', packageName);
    formData.append('unit', unit);
    formData.append('msrp', msrp);
    formData.append('supplyPrice', supplyPrice);
    formData.append('description', description);
    if (imagePath){
      formData.append('imgSrc', imagePath);
    }
    console.log('omSubmit imagePath', imagePath)
    registerItemAPI(formData)
    .then((data) => {
      Router.replace(`/item/${data.id}`);
    })
    .catch((error) => {
      alert(error.response.data);
    })
  }, [codeName, name, packageName, unit, msrp, supplyPrice, imagePath, description]);

  // 제품 제거
  const onDeleteSubmit = useCallback(() => {
    setLoading(true);
    deleteItemAPI({ itemId: item.id })
    .then((data) => {
      console.log(data);
    })
    .catch((error) => {
      alert(error.response.data);
    })
    .finally(() => {
      Router.replace(`/management/items`);
      setLoading(false);
    });
  }, []);

  return (
    <>
      <Divider>제품 수정 {itemId}</Divider>
      <Form>
        <div style={{ textAlign: 'center' }}>
          <label htmlFor="user-price">제품사진 (2MB 제한)</label>
          <input type="file" accept="image/*" name="image" hidden ref={imageInput} onChange={onChangeImage} />
          <Button onClick={onClickImageUpload}>이미지 업로드</Button>
          {imagePath?
            <div>
              <Image src={`${backUrl}/${item.imgSrc}`} height={300} />
              <div>
                <Button onClick={onRemoveImage}>제거</Button>
              </div>
            </div> : null
          }
        </div>
        <Descriptions
          bordered
          size="small"
          title={item.User.company}
          extra={item.UserId === myUserInfo.id ? 
            <><Button onClick={()=> (Router.replace(`/management/items`))}>목록으로 돌아가기</Button></>
          : null}
        >
          <Descriptions.Item label={
              <>제품 코드명<span style={{color: 'blue'}}>*</span></>
          }>
            <Input value={codeName} onChange={onChangeCodeName} maxLength={10}/>
          </Descriptions.Item>
          <Descriptions.Item label="제품명">
            <Input value={name} onChange={onChangeName} maxLength={25}/>
          </Descriptions.Item>
          <Descriptions.Item label="포장">
            <Input value={packageName} onChange={onChangePack} maxLength={20}/>
          </Descriptions.Item>
          <Descriptions.Item label="무게단위">
            <Input value={unit} onChange={onChangeUnit} maxLength={10}/>
          </Descriptions.Item>
          <Descriptions.Item label={<><span>권장소비자가</span> <span style={{color: 'blue'}}>*</span></>}>
            <Input value={msrp} onChange={onChangeMsrp} maxLength={20}/>
          </Descriptions.Item>
          <Descriptions.Item label="공급가">
            <Input value={supplyPrice} onChange={onChangePrice} maxLength={12}/>
          </Descriptions.Item>
          <Descriptions.Item label="제품설명">
            <Input value={description} onChange={onChangeDesc} maxLength={12}/>
          </Descriptions.Item>
        </Descriptions>
        <p style={{color: 'blue', margin: '10px'}}>* 고객 비노출 항목</p>
        <Space size="middle" style={{ marginTop: '20px' }}>
          <Button type="primary" onClick={onEditSubmit} loading={loading}>
            제품 수정
          </Button>
          <Button onClick={onCreateSubmit} loading={loading}>
            제품 복사생성
          </Button>
          <Popconfirm
            title="삭제하시겠습니까?"
            onConfirm={onDeleteSubmit}
            okText="삭제"
            cancelText="취소"
          >
            <Button loading={loading}>
              제품 삭제
            </Button>
          </Popconfirm>

        </Space>
      </Form>
    </>
  )
}

export default ItemEdit;
