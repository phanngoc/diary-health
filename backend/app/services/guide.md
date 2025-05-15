

Thêm nhật kí note bằng giọng nói 
=> phân tách thành các [medication, liều lượng]
=> tập trung vào trải nghiệm y tế sau khi dùng thuốc

```python
class MedicationLogBase(SQLModel):
    taken_at: datetime
    notes: Optional[str] = None
    feeling_after: Optional[str] = None

class MedicationLogMedication(SQLModel, table=True):
    medication_log_id: Optional[int] = Field(
        default=None,
        foreign_key="medicationlog.id",
        primary_key=True
    )
    medication_id: Optional[int] = Field(
        default=None,
        foreign_key="medication.id",
        primary_key=True
    )


class MedicationLog(MedicationLogBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    medications: List["Medication"] = Relationship(
        back_populates="logs",
        link_model=MedicationLogMedication
    )

class MedicationBase(SQLModel):
    name: str
    dosage: str
    frequency: str
    notes: Optional[str] = None

class Medication(MedicationBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    logs: List["MedicationLog"] = Relationship(
        back_populates="medications",
        link_model=MedicationLogMedication
    )
```


---

### Câu này là trích xuất đơn thuốc nếu có.
```python
# Define the prompt template
EXTRACT_MEDICATION_PROMPT = """
You are a medical assistant that extracts information about medications from user notes.
Please extract the following information from the user's medication note:
- Medication name
- Dosage
- Frequency (how often they take it)

User note: {note}

Respond with a JSON object in the following format:
```json
{
  "medication_name": "name of the medication",
  "dosage": "dosage information",
  "frequency": "how often they take it",
}
```

If any information is not provided in the note, use null for that field.
"""
```

### Câu prompt trích xuất trải nghiệm người dùng như 
[
    taken_at: datetime (nếu không có tự động fill thời gian hiện tại)
    notes: Optional[str] = None
    feeling_after: Optional[str] = None
    medication: tên thuốc có liên quan.
]

```python
# Define the prompt template for user experience extraction
EXTRACT_USER_EXPERIENCE_PROMPT = """
You are a medical assistant analyzing user experiences with medications.
Please extract the following information from the user's note:

- When they took the medication (time/date)
- Any notes or comments about their experience
- How they felt after taking the medication
- Names of any medications mentioned

User note: {note}

Respond with a JSON object in the following format:




### Từ cấu trúc table này chúng ta có được gì ?
- Biến được lịch trình sau khi sử dụng thuốc của user, có thể chia sẻ lên cồng đồng không, hay đây là nhật kí, không nên public, có thể chỉ extract thông tin general, tránh các tên riêng ?
- Nếu public đơn thuốc thì có thể đặt lịch cảnh bảo.


### Tạo todo list từ đơn thuốc.
![image](image.png)





