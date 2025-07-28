import styled from "styled-components";

const Header = styled.header`
  padding: 2rem 2rem 1rem 2rem;
  color: #fff;
  text-align: center;
  font-size: 2.7rem;
  font-weight: bold;
  letter-spacing: 2px;
  background: rgba(20,36,61,0.7);
  border-bottom: 2px solid #1976d2;
`;

export default function DashboardHeader() {
  return (
    <Header>
      Reportes IA AntisanaH2O
    </Header>
  );
}