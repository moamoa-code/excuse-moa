import { Button, Form } from "antd";
import Modal from "antd/lib/modal/Modal";
import React, { useCallback, useState } from "react";
import DaumPostcode from "react-daum-postcode";
import useInput from "../hooks/useInput";
import { Block } from "./Styled";

// 주소 등록 폼, 다음 주소 API 활용
const AddressForm = (props) => {
  const [isVisible, setIsVisible] = useState(false);
  const [zip, setZip] = useState("");
  const [address, onChangeAddress, setAddress] = useInput<string>("");
  const [address2, onChangeAddress2, setAddress2] = useInput<string>("");
  const [addrName, onChangeAddrName, setAddrName] = useInput("");
  const [phone, setPhone] = useState("");
  const [name, onChangeName] = useInput("");

  const onChangePhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    // 숫자만 입력받기
    const onlyNumber = value.replace(/[^0-9]/g, "");
    setPhone(onlyNumber);
  };

  const onSubmit = useCallback(() => {
    const fullAddress = address + " " + address2;
    const datas = { addrName, zip, address: fullAddress, name, phone };
    props.submitDatas(datas);
  }, [zip, address, addrName, phone, name]);

  const showModal = () => {
    setIsVisible(true);
  };

  const handleCancel = () => {
    setIsVisible(false);
  };

  const onCompletePost = (data) => {
    let fullAddr = data.address;
    let extraAddr = "";

    if (data.addressType === "R") {
      if (data.bname !== "") {
        extraAddr += data.bname;
      }
      if (data.buildingName !== "") {
        extraAddr +=
          extraAddr !== "" ? `, ${data.buildingName}` : data.buildingName;
      }
      fullAddr += extraAddr !== "" ? ` (${extraAddr})` : "";
    }

    setZip(data.zonecode);
    setAddress(fullAddr);
    setIsVisible(false);
  };

  return (
    <>
      <Modal
        visible={isVisible}
        onCancel={handleCancel}
        footer={[<Button onClick={handleCancel}>닫기</Button>]}
      >
        <DaumPostcode onComplete={onCompletePost} />
      </Modal>
      <Form onFinish={onSubmit}>
        <Block>
          <label>배송지 이름</label>
          <input
            value={addrName}
            onChange={onChangeAddrName}
            placeholder="예) 모아카페 ㅇㅇ점"
            maxLength={20}
            required
          />
        </Block>
        <Button type="primary" onClick={showModal}>
          우편번호 찾기
        </Button>
        <Block>
          <label>우편번호</label>
          <input
            value={zip}
            placeholder="우편번호 찾기를 통해 입력해주세요."
            readOnly
            required
          />
        </Block>
        <Block>
          <label>주소</label>
          <input
            value={address}
            placeholder="우편번호 찾기를 통해 입력해주세요."
            readOnly
            required
          />
        </Block>
        <Block>
          <label>주소 상세</label>
          <input
            value={address2}
            onChange={onChangeAddress2}
            maxLength={30}
            placeholder=""
            required
          />
        </Block>
        <Block>
          <label>받는분 이름</label>
          <input
            value={name}
            onChange={onChangeName}
            maxLength={18}
            placeholder=""
            required
          />
        </Block>
        <Block>
          <label>받는분 전화번호</label>
          <input
            value={phone}
            onChange={onChangePhone}
            maxLength={15}
            placeholder=" - 없이 입력"
            required
          />
        </Block>
        <hr />
        <Button type="primary" htmlType="submit" loading={props.loading}>
          저장
        </Button>
      </Form>
    </>
  );
};

export default AddressForm;
